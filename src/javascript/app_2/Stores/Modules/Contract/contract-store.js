import {
    action,
    computed,
    extendObservable,
    observable }                  from 'mobx';
import { isEmptyObject }          from '_common/utility';
import { localize }               from '_common/localize';
import { WS }                     from 'Services';
import { createChartBarrier }     from './Helpers/chart-barriers';
import { createChartMarkers }     from './Helpers/chart-markers';
import {
    getDetailsExpiry,
    getDetailsInfo }             from './Helpers/details';
import {
    getDigitInfo,
    isDigitContract }            from './Helpers/digits';
import {
    getChartGranularity,
    getChartType,
    getDisplayStatus,
    getEndSpot,
    getEndSpotTime,
    getEndTime,
    getFinalPrice,
    getIndicativePrice,
    isEnded,
    isSoldBeforeStart,
    isStarted,
    isUserSold,
    isValidToSell }              from './Helpers/logic';
import BaseStore                 from '../../base-store';

export default class ContractStore extends BaseStore {
    // --- Observable properties ---
    @observable contract_id;
    @observable contract_info = observable.object({});
    @observable digits_info   = observable.object({});
    @observable sell_info     = observable.object({});

    @observable has_error         = false;
    @observable error_message     = '';
    @observable is_sell_requested = false;

    // ---- Normal properties ---
    forget_id;
    is_granularity_set = false;
    is_left_epoch_set  = false;

    // -------------------
    // ----- Actions -----
    // -------------------
    @action.bound
    drawChart(SmartChartStore, contract_info) {
        this.forget_id = contract_info.id;
        const end_time = getEndTime(contract_info);
        const should_update_chart_type = !contract_info.tick_count && !this.is_granularity_set;

        if (end_time) {
            SmartChartStore.setRange(contract_info.date_start, end_time);

            if (should_update_chart_type) {
                this.handleChartType(SmartChartStore, contract_info.date_start, end_time);
            }

        } else if (!this.is_left_epoch_set) {
            this.is_left_epoch_set = true;
            SmartChartStore.setChartView(contract_info.purchase_time);
        } else if (should_update_chart_type) {
            this.handleChartType(SmartChartStore, contract_info.date_start, null);
        }

        createChartBarrier(SmartChartStore, contract_info);
        createChartMarkers(SmartChartStore, contract_info);

        this.handleDigits();
    }

    @action.bound
    onMount(contract_id) {
        if (contract_id === +this.contract_id) return;
        if (this.root_store.modules.smart_chart.is_contract_mode) this.onCloseContract();
        this.onSwitchAccount(this.accountSwitcherListener.bind(null));
        this.has_error         = false;
        this.error_message     = '';
        this.contract_id       = contract_id;
        this.smart_chart       = this.root_store.modules.smart_chart;

        if (contract_id) {
            this.smart_chart.saveAndClearTradeChartLayout();
            this.smart_chart.setContractMode(true);
            WS.subscribeProposalOpenContract(this.contract_id, this.updateProposal, false);
        }
    }

    @action.bound
    accountSwitcherListener () {
        this.smart_chart.setContractMode(false);
        return new Promise((resolve) => resolve(this.onCloseContract()));
    }

    @action.bound
    onCloseContract() {
        this.forgetProposalOpenContract();
        this.contract_id        = null;
        this.contract_info      = {};
        this.digits_info        = {};
        this.error_message      = '';
        this.forget_id          = null;
        this.has_error          = false;
        this.is_granularity_set = false;
        this.is_sell_requested  = false;
        this.is_left_epoch_set  = false;
        this.sell_info          = {};

        this.smart_chart.cleanupContractChartView();
        this.smart_chart.applySavedTradeChartLayout();
    }

    @action.bound
    onUnmount() {
        this.disposeSwitchAccount();
        this.onCloseContract();
    }

    @action.bound
    updateProposal(response) {
        if ('error' in response) {
            this.has_error     = true;
            this.error_message = response.error.message;
            this.contract_info = {};
            return;
        }
        if (isEmptyObject(response.proposal_open_contract)) {
            this.has_error     = true;
            this.error_message = localize('Contract does not exist or does not belong to this client.');
            this.contract_info = {};
            this.contract_id   = null;
            this.smart_chart.setContractMode(false);
            return;
        }
        if (+response.proposal_open_contract.contract_id !== +this.contract_id) return;

        this.contract_info = response.proposal_open_contract;

        // Set contract symbol if trade_symbol and contract_symbol don't match
        if (this.root_store.modules.trade.symbol !== this.contract_info.underlying) {
            this.root_store.modules.trade.updateSymbol(this.contract_info.underlying);
        }

        this.drawChart(this.smart_chart, this.contract_info);
    }

    @action.bound
    handleDigits() {
        if (isDigitContract(this.contract_info.contract_type)) {
            extendObservable(this.digits_info, getDigitInfo(this.digits_info, this.contract_info));
        }
    }

    @action.bound
    onClickSell() {
        if (this.contract_id && !this.is_sell_requested && isEmptyObject(this.sell_info)) {
            this.is_sell_requested = true;
            WS.sell(this.contract_id, this.contract_info.bid_price).then(this.handleSell);
        }
    }

    @action.bound
    handleSell(response) {
        if (response.error) {
            this.sell_info = {
                error_message: response.error.message,
            };

            this.is_sell_requested = false;
        } else {
            this.forgetProposalOpenContract();
            WS.proposalOpenContract(this.contract_id).then(action((proposal_response) => {
                this.updateProposal(proposal_response);
                this.sell_info = {
                    sell_price    : response.sell.sold_for,
                    transaction_id: response.sell.transaction_id,
                };
            }));
        }
    }

    handleChartType(SmartChartStore, start, expiry) {
        const chart_type  = getChartType(start, expiry);
        const granularity = getChartGranularity(start, expiry);

        if (chart_type === 'candle' && granularity !== 0) {
            SmartChartStore.updateGranularity(granularity);
            SmartChartStore.updateChartType(chart_type);
        } else {
            SmartChartStore.updateGranularity(0);
            SmartChartStore.updateChartType('mountain');
        }
        this.is_granularity_set = true;
    }

    forgetProposalOpenContract() {
        WS.forget('proposal_open_contract', this.updateProposal, { id: this.forget_id });
    }

    @action.bound
    removeSellError() {
        delete this.sell_info.error_message;
    }

    // ---------------------------
    // ----- Computed values -----
    // ---------------------------
    // TODO: currently this runs on each response, even if contract_info is deep equal previous one

    @computed
    get details_expiry() {
        return getDetailsExpiry(this);
    }

    @computed
    get details_info() {
        return getDetailsInfo(this.contract_info);
    }

    @computed
    get display_status() {
        return getDisplayStatus(this.contract_info);
    }

    @computed
    get end_spot() {
        return getEndSpot(this.contract_info);
    }

    @computed
    get end_spot_time() {
        return getEndSpotTime(this.contract_info);
    }

    @computed
    get final_price() {
        return getFinalPrice(this.contract_info);
    }

    @computed
    get indicative_price() {
        return getIndicativePrice(this.contract_info);
    }

    @computed
    get is_ended() {
        return isEnded(this.contract_info);
    }

    @computed
    get is_sold_before_start() {
        return isSoldBeforeStart(this.contract_info);
    }

    @computed
    get is_started() {
        return isStarted(this.contract_info);
    }

    @computed
    get is_user_sold() {
        return isUserSold(this.contract_info);
    }

    @computed
    get is_valid_to_sell() {
        return isValidToSell(this.contract_info);
    }
}

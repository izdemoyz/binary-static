import PropTypes  from 'prop-types';
import React      from 'react';

const IconInitialLogoDark = ({ className, classNamePath, classNameRect }) => (
    <svg className={className} xmlnsXlink='http://www.w3.org/1999/xlink' width='90' height='90' viewBox='0 0 90 90'>
        <defs>
            <circle id='a' cx='45' cy='45' r='43' />
        </defs>
        <g>
            <g>
                <mask id='b' y='0' fill='#fff'>
                    <use xlinkHref='#a' />
                </mask>
                <path className={classNamePath} fillRule='nonzero' d='M0 0h90v90H0z' mask='url(#b)' />
                <rect className={classNameRect} height='90' width='90' mask='url(#b)'>
                    <animate attributeName='y' from='90' to='0' dur='2.6s' />
                </rect>
            </g>
            <path
                fill='#2A3052'
                fillRule='evenodd'
                d='M31.104 57.969c4.79-.324 3.05 4.245 3.05 4.245l.91 1.696c-3.418-1.882-3.96-5.941-3.96-5.941zm15.861-29.175l1.195 1.556s-1.01 4.89 3.781 3.798c0 0-1.211-4.012-4.976-5.354zm25.201 43.382c7.259-7.267 11.259-16.91 11.259-27.174 0-7.664-2.225-14.984-6.39-21.22l-.184-.276a39.239 39.239 0 0 0-4.685-5.672C59.18 4.85 39.132 3.136 24.29 12.654c2.227-.481 3.95-.675 11.536 1.108.551-.345 4.6-.74 7.279-.053 5.843 1.51 6.472 1.922 8.409 2.673 5.547 2.158 6.398 3.812 16.406 7.118 3.182 1.05 4.902.663 4.842.768-.196.599-1.927.99-2.485 1.091-.53.109-1.432.292-2.95.264-3.922-.054-6.727-.935-15.3-3.184 0 0 2.156.928 4.144 1.598 1.546.513 1.931.65 4.365 1.583 5.256 2.007 6.35 1.744 6.59 1.948-.134.562-2.094.779-4.57.858-1.796.043-1.086.065-3.334-.177-3.96-.442-5.34-1.257-7.367-1.589 0 0 .09.118.163.184l.23.284c1.4 1.513 2.704 2.972 2.5 5.246-.005.05-.829 3.221 3.93 8.276.083.058.152.135.217.199.409.413.734.848.988 1.08.486.51.7.93.685 1.412-.01.857-.751 1.903-2.467 3.465-1.046.96-6.006 3.235-8.818 2.496-.83-.218-1.91-.688-3.261-1.27-1.592-.687-3.596-1.546-5.868-2.274l-1.355-.43c-3.26-1.063-4.414-.947-6.305-.958-2.095 0-3.326 1.936-3.326 1.936s-2.19 1.33-2.7 1.659c-.414.275-2.334 2.245-2.483 3.138-.016.128-.005.208.037.263.19.258.46.534.751.825.424.445.923.96 1.248 1.513.556.933.724 1.521 2.335 3.435l.022.058c.019.055.235 4.182 1.832 6.262 1.447 1.895 3.566 5.042 3.566 5.042s.73 1.183.315 1.603c-.596.642-1.206 2.49.592 4.28.123.12.26.253.406.37 1.63 1.298 3.216.945 4.368.26.294-.167 1.571.519 1.97.786 1.584 1.059 4.386 1.075 10.031 2.203.097 0 8.425 4.385 19.24-4.428.496-.451.979-.919 1.47-1.4zM76.82 13.17c17.573 17.548 17.573 46.11 0 63.662-17.547 17.553-46.103 17.56-63.657.004-17.55-17.555-17.55-46.118 0-63.67 17.554-17.555 46.1-17.555 63.657.004z'
            />
        </g>
    </svg>
);

IconInitialLogoDark.propTypes = {
    className    : PropTypes.string,
    classNamePath: PropTypes.string,
    classNameRect: PropTypes.string,
};

export { IconInitialLogoDark };

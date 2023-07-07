import PropTypes from 'prop-types';
import css from './Modal.module.css';

export const Modal = ({ largeImageURL, alt, action, actionKey }) => (
  <div className={css.overlay} onClick={action}>
    <div className={css.modal} tabIndex={0} onKeyDown={actionKey}>
      <img src={largeImageURL} alt={alt} />
    </div>
  </div>
);

Modal.propTypes = {
  largeImageURL: PropTypes.string,
  alt: PropTypes.string,
  action: PropTypes.func,
  actionKey: PropTypes.func,
};

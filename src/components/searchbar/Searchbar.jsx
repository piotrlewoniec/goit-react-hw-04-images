import PropTypes from 'prop-types';
import css from './Searchbar.module.css';

export const Searchbar = ({ onSubmit }) => (
  <header className={css.searchbar}>
    <form name="searchimages" className={css.searchform}>
      <button
        className={css.searchform_button}
        type="submit"
        onClick={onSubmit}
      >
        <span className={css.searchform_button_label}>Search</span>
      </button>
      <input
        className={css.searchform_input}
        name="inputsearch"
        type="text"
        autoComplete="off"
        autoFocus
        placeholder="Search images and photos"
      />
    </form>
  </header>
);

Searchbar.propTypes = {
  onSubmit: PropTypes.func,
};

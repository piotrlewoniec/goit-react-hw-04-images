import PropTypes from 'prop-types';
import css from './ImageGalleryItem.module.css';

export const ImageGalleryItem = ({ id, webformatURL, largeImageURL, alt }) => (
  <li className={css.imagegalleryitem}>
    <img
      className={css.imagegalleryitem_image}
      src={webformatURL}
      alt={alt}
      data-id={id}
      data-img={largeImageURL}
      data-alt={alt}
    />
  </li>
);

ImageGalleryItem.propTypes = {
  id: PropTypes.number,
  webformatURL: PropTypes.string,
  largeImageURL: PropTypes.string,
  alt: PropTypes.string,
};

import * as PropTypes from 'prop-types';

import LoadingButton from '@mui/lab/LoadingButton';

function CustomButton({
  size,
  sx,
  color,
  disabled,
  endIcon,
  fullWidth,
  href,
  startIcon,
  variant,
  children,
  onClick,
  loading,
  text,
}) {
  return (
    <LoadingButton
      sx={sx}
      size={size}
      color={color}
      disabled={disabled}
      endIcon={endIcon}
      fullWidth={fullWidth}
      href={href}
      loading={loading}
      startIcon={startIcon}
      onClick={onClick}
      variant={variant}
    >
      {text || children}
    </LoadingButton>
  );
}

CustomButton.propTypes = {
  size: PropTypes.string,
  sx: PropTypes.object,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  endIcon: PropTypes.any,
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  href: PropTypes.any,
  children: PropTypes.any,
  onClick: PropTypes.any,
  startIcon: PropTypes.any,
  variant: PropTypes.string,
  text: PropTypes.string,
};

CustomButton.defaultProps = {
  size: 'medium',
  color: 'primary',
  disabled: false,
  fullWidth: true,
  variant: 'contained',
  loading: false,
};

export default CustomButton;

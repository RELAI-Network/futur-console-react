/* eslint-disable no-debugger */
import { useState } from 'react';
import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-extraneous-dependencies
import Identicon from '@polkadot/react-identicon';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import { alpha } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useAuth } from '../../../hooks/use_auth';
import { useRouter } from '../../../routes/hooks';
import { logUserOut } from '../../../services/firebase/firestore/auth';

// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
    url: '/',
  },
  {
    label: 'Profile',
    icon: 'eva:person-fill',
    url: '/profile',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
    url: '/settings',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover({ noActions = false }) {
  const [open, setOpen] = useState(null);

  const { user, logout } = useAuth();

  const router = useRouter();
  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const onLogOut = () => {
    logUserOut({
      userId: user.uid,
      onError: (errorMessage) => {
        router.reload();
      },
      onSuccess: () => {
        logout();
      },
    }).finally(() => {
      handleClose(null);
    });
  };

  const handleClose = (url) => {
    if (url) {
      debugger;
      router.push(url);
    }
    setOpen(null);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          width: 40,
          height: 40,
          background: (theme) => alpha(theme.palette.grey[500], 0.08),
          ...(open && {
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          }),
        }}
      >
        <Identicon
          value={user.web3_account_address}
          size={36}
          theme="polkadot" /// 'polkadot', 'substrate' (default), 'beachball' or 'jdenticon'
          sx={{
            width: 36,
            height: 36,
            border: (theme) => `solid 2px ${theme.palette.background.default}`,
          }}
        />
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={() => handleClose()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1,
            ml: 0.75,
            width: 200,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {user.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {(noActions ? [] : MENU_OPTIONS)
          .map((option) => ({
            ...option,
            url: `${user.role}${option.url}`,
          }))
          .map((option) => (
            <MenuItem key={option.label} onClick={() => handleClose(option.url)}>
              {option.label}
            </MenuItem>
          ))}

        <Divider sx={{ borderStyle: 'dashed', m: 0 }} />

        <MenuItem
          disableRipple
          disableTouchRipple
          onClick={onLogOut}
          sx={{ typography: 'body2', color: 'error.main', py: 1.5 }}
        >
          Logout
        </MenuItem>
      </Popover>
    </>
  );
}

AccountPopover.propTypes = {
  noActions: PropTypes.bool,
};

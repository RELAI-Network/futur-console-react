import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/',
    icon: icon('ic_analytics'),
  },
  {
    title: 'books',
    path: '/books',
    icon: icon('ebook'),
  },
  {
    title: 'account',
    path: 'publisher/account',
    icon: icon('account'),
  },
  {
    title: 'monetization',
    path: 'publisher/monetization',
    icon: icon('money'),
  },
  {
    title: 'settings',
    path: 'publisher/settings',
    icon: icon('setting'),
  },
];

export default navConfig;

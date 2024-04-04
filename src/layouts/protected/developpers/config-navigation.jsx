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
    title: 'apps',
    path: '/apps',
    icon: icon('app'),
  },
  {
    title: 'games',
    path: '/games',
    icon: icon('game'),
  },
  {
    title: 'account',
    path: 'developer/account',
    icon: icon('account'),
  },
  {
    title: 'settings',
    path: 'developer/settings',
    icon: icon('setting'),
  },
];

export default navConfig;

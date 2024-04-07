import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'dashboard',
    path: '/publisher',
    icon: icon('ic_analytics'),
    index: true,
  },
  {
    title: 'books',
    path: '/books',
    icon: icon('ebook'),
  },
  {
    title: 'account',
    path: '/publisher/account',
    icon: icon('account'),
  },
  // {
  //   title: 'settings',
  //   path: '/publisher/settings',
  //   icon: icon('setting'),
  // },
];

export default navConfig;

// Re-export React Admin theme components
export {
  defaultTheme,
  ThemeProvider,
  useTheme
} from 'react-admin';

// createTheme doesn't exist in react-admin, use Material-UI instead
export { createTheme } from '@mui/material/styles';
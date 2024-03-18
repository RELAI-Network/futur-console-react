import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useFormValidation } from 'src/utils/forms/hooks/useFormValidation';

import Iconify from 'src/components/iconify';
import Tableview from 'src/components/table_view';

// ----------------------------------------------------------------------

export default function AppsView() {
  const form = useFormValidation({});

  return (
    <Container maxWidth="xl">
      <Divider color="primary" />
      <br />
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        sx={{ mb: 5 }}
        justifyContent="space-between"
      >
        <Stack direction="row" alignItems="center">
          <Box sx={{ mr: 1 }}>
            <img src="/assets/icons/navbar/apps.svg" alt="Applications" width={36} />
          </Box>
          <Typography variant="h5">Applications</Typography>
        </Stack>
        <Box>
          <Button
            href="apps/create"
            variant="contained"
            color="inherit"
            startIcon={<Iconify icon="eva:plus-fill" />}
          >
            Add
          </Button>
        </Box>
      </Stack>
      <Box>
        <TextField
          name="search"
          label="Search application"
          required
          helperText={form.validationErrors.searchApp}
          error={!!form.validationErrors.searchApp}
          onChange={(e) => form.setFieldValue('searchApp', e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="material-symbols:search" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <br />
      <Tableview
        addNewBtnLabel="Add"
        title="Applications"
        fields={[
          {
            attribute: 'name',
          },
        ]}
        headers={[
          {
            attribute: 'name',
            label: 'Name',
          },
        ]}
        identifier="id"
        items={[]}
        showHeader={false}
        showSearchAndFilter={false}
      />
    </Container>
  );
}

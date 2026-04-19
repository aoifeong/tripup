import { render } from '@testing-library/react-native';
import FormField from '../components/FormField';

describe('Basic integration-style render', () => {
  it('renders a field on screen', () => {
    const { getByPlaceholderText, getByText } = render(
      <FormField
        label="Trip Name"
        value=""
        onChangeText={() => {}}
        placeholder="Enter trip"
      />
    );

    expect(getByText('Trip Name')).toBeTruthy();
    expect(getByPlaceholderText('Enter trip')).toBeTruthy();
  });
});
import { fireEvent, render } from '@testing-library/react-native';
import FormField from '../components/FormField';

describe('FormField', () => {
  it('renders the label and placeholder correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <FormField
        label="Trip Title"
        value=""
        onChangeText={() => {}}
        placeholder="Enter trip title"
      />
    );

    expect(getByText('Trip Title')).toBeTruthy();
    expect(getByPlaceholderText('Enter trip title')).toBeTruthy();
  });

  it('fires onChangeText with the new value when user types', () => {
    const onChange = jest.fn();

    const { getByPlaceholderText } = render(
      <FormField
        label="Name"
        value=""
        onChangeText={onChange}
        placeholder="Enter name"
      />
    );

    const input = getByPlaceholderText('Enter name');
    fireEvent.changeText(input, 'Barcelona');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Barcelona');
  });

  it('shows the current value passed in as a prop', () => {
    const { getByDisplayValue } = render(
      <FormField
        label="Destination"
        value="Rome"
        onChangeText={() => {}}
        placeholder="Enter destination"
      />
    );

    expect(getByDisplayValue('Rome')).toBeTruthy();
  });
});
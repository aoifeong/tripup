import { fireEvent, render } from '@testing-library/react-native';
import FormField from '../components/FormField';

describe('FormField', () => {
  it('updates text correctly', () => {
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
    fireEvent.changeText(input, 'Test');

    expect(onChange).toHaveBeenCalledWith('Test');
  });
});
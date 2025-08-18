// components/FormComponents.tsx
import React from 'react';
import { TextInput, Textarea } from '@mantine/core';
import { UseFormRegister, FieldErrors, RegisterOptions } from 'react-hook-form';

// Helper function to safely get error message
const getErrorMessage = (errors: FieldErrors, fieldName: string): string | undefined => {
    const error = errors[fieldName];
    if (!error) return undefined;

    if (typeof error === 'string') return error;
    if (typeof error === 'object' && 'message' in error) {
        return error.message as string;
    }
    return 'Invalid input';
};

// Base interfaces
interface BaseFieldProps {
    name: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    rules?: RegisterOptions;
    errors: FieldErrors;
}

// FOR USE WITH register()
interface RegisterTextInputProps extends BaseFieldProps {
    register: UseFormRegister<any>;
    type?: 'text' | 'email' | 'password' | 'number';
    maxLength?: number;
    allowNumbers?: boolean;
    allowSpecialChars?: boolean;
}

export const RegisterTextInput: React.FC<RegisterTextInputProps> = ({
    register,
    errors,
    name,
    label,
    placeholder,
    required = false,
    rules,
    type = 'text',
    maxLength,
    allowNumbers = true,
    allowSpecialChars = true,
    ...props
}) => {
    const registrationProps = register(name, rules);

    // Prevent unwanted characters from being typed
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const char = event.key;

        // Allow control characters (backspace, delete, arrow keys, etc.)
        if (event.ctrlKey || event.metaKey || char.length > 1) {
            return;
        }

        // Get current value to check length
        const currentValue = (event.target as HTMLInputElement).value;

        // Prevent typing beyond max length
        if (maxLength && currentValue.length >= maxLength) {
            event.preventDefault();
            return;
        }

        // Prevent numbers if not allowed
        if (!allowNumbers && /[0-9]/.test(char)) {
            event.preventDefault();
            return;
        }

        // Prevent special characters if not allowed (allow only letters and spaces)
        if (!allowSpecialChars && /[^a-zA-Z\s]/.test(char)) {
            event.preventDefault();
            return;
        }
    };

    // Handle paste events
    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();

        let pastedData = event.clipboardData.getData('text');
        const currentValue = (event.target as HTMLInputElement).value;

        // Apply filters to pasted content
        if (!allowNumbers) {
            pastedData = pastedData.replace(/[0-9]/g, '');
        }

        if (!allowSpecialChars) {
            pastedData = pastedData.replace(/[^a-zA-Z\s]/g, '');
        }

        // Apply length restriction
        let newValue = currentValue + pastedData;
        if (maxLength && newValue.length > maxLength) {
            newValue = newValue.slice(0, maxLength);
        }

        // Create a synthetic event to trigger the form update
        const syntheticEvent = {
            target: {
                ...event.target,
                value: newValue
            }
        } as React.ChangeEvent<HTMLInputElement>;

        registrationProps.onChange(syntheticEvent);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // This is a backup filter for edge cases
        let value = event.target.value;

        if (!allowNumbers) {
            value = value.replace(/[0-9]/g, '');
        }

        if (!allowSpecialChars) {
            value = value.replace(/[^a-zA-Z\s]/g, '');
        }

        if (maxLength && value.length > maxLength) {
            value = value.slice(0, maxLength);
        }

        event.target.value = value;
        registrationProps.onChange(event);
    };

    return (
        <TextInput
            label={label}
            placeholder={placeholder}
            type={type}
            {...registrationProps}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            error={getErrorMessage(errors, name)}
            required={required}
            {...props}
        />
    );
};

// FOR USE WITH Controller
interface ControllerTextInputProps extends BaseFieldProps {
    type?: 'text' | 'email' | 'password' | 'number';
    maxLength?: number;
    allowNumbers?: boolean;
    allowSpecialChars?: boolean;
    // Controller field props
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: string;
    disabled?: boolean;
}

export const ControllerTextInput: React.FC<ControllerTextInputProps> = ({
    errors,
    name,
    label,
    placeholder,
    required = false,
    type = 'text',
    maxLength,
    allowNumbers = true,
    allowSpecialChars = true,
    onChange,
    onBlur,
    value,
    disabled,
    ...props
}) => {
    // Prevent unwanted characters from being typed
    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        const char = event.key;

        // Allow control characters (backspace, delete, arrow keys, etc.)
        if (event.ctrlKey || event.metaKey || char.length > 1) {
            return;
        }

        // Prevent typing beyond max length
        if (maxLength && value.length >= maxLength) {
            event.preventDefault();
            return;
        }

        // Prevent numbers if not allowed
        if (!allowNumbers && /[0-9]/.test(char)) {
            event.preventDefault();
            return;
        }

        // Prevent special characters if not allowed
        if (!allowSpecialChars && /[^a-zA-Z\s]/.test(char)) {
            event.preventDefault();
            return;
        }
    };

    // Handle paste events
    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();

        let pastedData = event.clipboardData.getData('text');

        // Apply filters to pasted content
        if (!allowNumbers) {
            pastedData = pastedData.replace(/[0-9]/g, '');
        }

        if (!allowSpecialChars) {
            pastedData = pastedData.replace(/[^a-zA-Z\s]/g, '');
        }

        // Apply length restriction
        let newValue = value + pastedData;
        if (maxLength && newValue.length > maxLength) {
            newValue = newValue.slice(0, maxLength);
        }

        // Only update if there's valid content
        if (newValue !== value) {
            onChange(newValue);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let newValue = event.target.value;

        // Apply filters as backup
        if (!allowNumbers) {
            newValue = newValue.replace(/[0-9]/g, '');
        }

        if (!allowSpecialChars) {
            newValue = newValue.replace(/[^a-zA-Z\s]/g, '');
        }

        // Apply length restriction
        if (maxLength && newValue.length > maxLength) {
            newValue = newValue.slice(0, maxLength);
        }

        onChange(newValue);
    };

    return (
        <TextInput
            label={label}
            placeholder={placeholder}
            type={type}
            value={value}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            onBlur={onBlur}
            disabled={disabled}
            error={getErrorMessage(errors, name)}
            required={required}
            {...props}
        />
    );
};

// Similar pattern for Textarea
interface RegisterTextareaProps extends BaseFieldProps {
    register: UseFormRegister<any>;
    maxLength?: number;
    minRows?: number;
    maxRows?: number;
    autosize?: boolean;
    allowNumbers?: boolean;
    allowSpecialChars?: boolean;
}

export const RegisterTextarea: React.FC<RegisterTextareaProps> = ({
    register,
    errors,
    name,
    label,
    placeholder,
    required = false,
    rules,
    maxLength = 500,
    minRows = 2,
    maxRows = 10,
    autosize = true,
    allowNumbers = true,
    allowSpecialChars = true,
    ...props
}) => {
    const registrationProps = register(name, rules);

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const char = event.key;

        if (event.ctrlKey || event.metaKey || char.length > 1) {
            return;
        }

        const currentValue = (event.target as HTMLTextAreaElement).value;

        if (maxLength && currentValue.length >= maxLength) {
            event.preventDefault();
            return;
        }

        if (!allowNumbers && /[0-9]/.test(char)) {
            event.preventDefault();
            return;
        }

        if (!allowSpecialChars && /[^a-zA-Z\s]/.test(char)) {
            event.preventDefault();
            return;
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();

        let pastedData = event.clipboardData.getData('text');
        const currentValue = (event.target as HTMLTextAreaElement).value;

        if (!allowNumbers) {
            pastedData = pastedData.replace(/[0-9]/g, '');
        }

        if (!allowSpecialChars) {
            pastedData = pastedData.replace(/[^a-zA-Z\s]/g, '');
        }

        let newValue = currentValue + pastedData;
        if (maxLength && newValue.length > maxLength) {
            newValue = newValue.slice(0, maxLength);
        }

        const syntheticEvent = {
            target: {
                ...event.target,
                value: newValue
            }
        } as React.ChangeEvent<HTMLTextAreaElement>;

        registrationProps.onChange(syntheticEvent);
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        let value = event.target.value;

        if (!allowNumbers) {
            value = value.replace(/[0-9]/g, '');
        }

        if (!allowSpecialChars) {
            value = value.replace(/[^a-zA-Z\s]/g, '');
        }

        if (maxLength && value.length > maxLength) {
            value = value.slice(0, maxLength);
        }

        event.target.value = value;
        registrationProps.onChange(event);
    };

    return (
        <Textarea
            label={label}
            placeholder={placeholder}
            {...registrationProps}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            error={getErrorMessage(errors, name)}
            maxLength={maxLength}
            autosize={autosize}
            minRows={minRows}
            maxRows={maxRows}
            required={required}
            {...props}
        />
    );
};

interface ControllerTextareaProps extends BaseFieldProps {
    maxLength?: number;
    minRows?: number;
    maxRows?: number;
    autosize?: boolean;
    allowNumbers?: boolean;
    allowSpecialChars?: boolean;
    // Controller field props
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: string;
    disabled?: boolean;
}

export const ControllerTextarea: React.FC<ControllerTextareaProps> = ({
    errors,
    name,
    label,
    placeholder,
    required = false,
    maxLength = 500,
    minRows = 2,
    maxRows = 10,
    autosize = true,
    allowNumbers = true,
    allowSpecialChars = true,
    onChange,
    onBlur,
    value,
    disabled,
    ...props
}) => {
    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const char = event.key;

        if (event.ctrlKey || event.metaKey || char.length > 1) {
            return;
        }

        if (maxLength && value.length >= maxLength) {
            event.preventDefault();
            return;
        }

        if (!allowNumbers && /[0-9]/.test(char)) {
            event.preventDefault();
            return;
        }

        if (!allowSpecialChars && /[^a-zA-Z\s]/.test(char)) {
            event.preventDefault();
            return;
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        event.preventDefault();

        let pastedData = event.clipboardData.getData('text');

        if (!allowNumbers) {
            pastedData = pastedData.replace(/[0-9]/g, '');
        }

        if (!allowSpecialChars) {
            pastedData = pastedData.replace(/[^a-zA-Z\s]/g, '');
        }

        let newValue = value + pastedData;
        if (maxLength && newValue.length > maxLength) {
            newValue = newValue.slice(0, maxLength);
        }

        if (newValue !== value) {
            onChange(newValue);
        }
    };

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        let newValue = event.target.value;

        if (!allowNumbers) {
            newValue = newValue.replace(/[0-9]/g, '');
        }

        if (!allowSpecialChars) {
            newValue = newValue.replace(/[^a-zA-Z\s]/g, '');
        }

        if (maxLength && newValue.length > maxLength) {
            newValue = newValue.slice(0, maxLength);
        }

        onChange(newValue);
    };

    return (
        <Textarea
            label={label}
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onPaste={handlePaste}
            onBlur={onBlur}
            disabled={disabled}
            error={getErrorMessage(errors, name)}
            maxLength={maxLength}
            autosize={autosize}
            minRows={minRows}
            maxRows={maxRows}
            required={required}
            {...props}
        />
    );
};
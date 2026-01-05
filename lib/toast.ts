import { toast } from 'react-hot-toast';

export const getErrorMessage = (error: any): string => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        return error.response.data.errors.map((e: any) => e.message).join(', ');
    }
    return error.message || 'An unexpected error occurred';
};

export const showSuccess = (message: string) => {
    toast.success(message, {
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        },
    });
};

export const showError = (error: any) => {
    const message = getErrorMessage(error);
    toast.error(message, {
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        },
    });
};

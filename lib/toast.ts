import { toast } from 'react-hot-toast';
export { toast };


export const getErrorMessage = (error: any): string => {
    const data = error.response?.data;

    // Prioritize detailed errors if available
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.map((e: any) => e.message || e).join(', ');
    }

    if (data?.message) {
        return data.message;
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

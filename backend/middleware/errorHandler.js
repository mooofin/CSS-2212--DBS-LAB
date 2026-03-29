const errorHandler = (err, req, res, next) => {
    // Log error for debugging (keep minimal for production)
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', err.message);
        console.error('Stack:', err.stack);
    }

    // Handle MySQL duplicate entry errors
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            error: 'A record with this value already exists',
        });
    }

    // Handle MySQL foreign key constraint errors
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            error: 'Referenced record does not exist',
        });
    }

    // Handle MySQL connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
        return res.status(503).json({
            error: 'Database connection error. Please try again later.',
        });
    }

    // Handle validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.details || err.message,
        });
    }

    // Default error response
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;

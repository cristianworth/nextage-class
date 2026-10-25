using Microsoft.AspNetCore.Diagnostics;

namespace NextageClass.Api.Infrastructure;

public sealed class ApiFailure(int status, string message) : Exception(message)
{
    public int Status { get; } = status;
}

public sealed class ApiFailureHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not ApiFailure failure) return false;
        await Results.Problem(statusCode: failure.Status, title: failure.Message).ExecuteAsync(context);
        return true;
    }
}

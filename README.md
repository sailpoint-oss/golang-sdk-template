# SailPoint Go SDK Template

A template project for the [SailPoint Go SDK](https://developer.sailpoint.com/docs/tools/sdk/go/). It is initialized using the [SailPoint CLI](https://developer.sailpoint.com/docs/tools/cli) and provides working examples of common Identity Security Cloud API calls using the Go SDK.

## Prerequisites

- **Go** version 1.18 or above ([download](https://go.dev/dl/))
- **SailPoint CLI** installed and configured ([installation guide](https://developer.sailpoint.com/docs/tools/cli))
- A SailPoint Identity Security Cloud tenant
- A **Personal Access Token (PAT)** with a client ID and client secret ([creating a PAT](https://developer.sailpoint.com/docs/api/authentication#personal-access-tokens))

## Getting Started

### 1. Create the project

Use the SailPoint CLI to create a new project from this template:

```bash
sail sdk init golang go-example
```

This creates the following project structure:

```
go-example/
├── go.mod
├── go.sum
└── sdk.go
```

### 2. Navigate into the project

```bash
cd go-example
```

### 3. Install dependencies

```bash
go mod tidy
```

### 4. Configure the SDK

The SDK needs credentials to authenticate with your SailPoint tenant. Generate a `config.json` file using the CLI:

```bash
sail sdk init config
```

This creates a `config.json` in the project directory using your currently configured CLI credentials. The file looks like this:

```json
{
  "ClientId": "your-client-id",
  "ClientSecret": "your-client-secret",
  "BaseURL": "https://[tenant].api.identitynow.com"
}
```

If you have multiple environments configured in the CLI, specify which one to use:

```bash
sail sdk init config --env devrel
```

> **Tip:** Add `config.json` to your `.gitignore` so credentials are not committed to version control.

### 5. Run the project

```bash
go run sdk.go
```

## What's Included

The `sdk.go` file contains several example functions demonstrating common SDK operations:

| Function                 | Description                                                   |
| ------------------------ | ------------------------------------------------------------- |
| `getBeta`                | Lists accounts using the **Beta** API                         |
| `getResults`             | Lists accounts using the **V3** API                           |
| `getSearchResults`       | Performs an identity search using `PaginateSearchApi`         |
| `getTransformResults`    | Lists transforms using the **V3** API                         |
| `getAllPaginatedResults` | Demonstrates automatic pagination with `PaginateWithDefaults` |

By default, the `main` function calls `getBeta`. You can uncomment or swap in any of the other functions to try different API calls.

## Customization

- **Change the endpoint** — swap `ListAccounts` for another method like `GetAccount` or `ListSources`.
- **Change the API collection** — swap `AccountsAPI` for another collection like `TransformsAPI` or `SourcesAPI`.
- **Change the API version** — swap `V3` for `Beta`, `V2`, or `CC` to access different API versions.

## Resources

- [Go SDK Documentation](https://developer.sailpoint.com/docs/tools/sdk/go/)
- [Go SDK Getting Started Guide](https://developer.sailpoint.com/docs/tools/sdk/go/getting-started)
- [SailPoint CLI Documentation](https://developer.sailpoint.com/docs/tools/cli)
- [Identity Security Cloud API Reference](https://developer.sailpoint.com/docs/api/)
- [Go SDK GitHub Repository](https://github.com/sailpoint-oss/golang-sdk)
- [SailPoint Developer Community](https://developer.sailpoint.com/discuss)

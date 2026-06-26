package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	sailpoint "github.com/sailpoint-oss/golang-sdk/v3"
	api_accounts "github.com/sailpoint-oss/golang-sdk/v3/accounts"
)

func main() {

	ctx := context.TODO()

	configuration := sailpoint.NewDefaultConfiguration()

	apiClient := sailpoint.NewAPIClient(configuration)
	configuration.HTTPClient.RetryMax = 10

	getResults(ctx, apiClient)

	//getAllPaginatedResults(ctx, apiClient)

}

func getResults(ctx context.Context, apiClient *sailpoint.APIClient) {
	resp, r, err := apiClient.AccountsAPI.ListAccountsV1(ctx).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AccountsAPI.ListAccountsV1`: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListAccountsV1`: []Account
	fmt.Fprintf(os.Stdout, "First response from `AccountsAPI.ListAccountsV1`: %v\n", resp[0].Name)
}

func getSearchResults(ctx context.Context, apiClient *sailpoint.APIClient) {
	searchString := []byte(`
	{
	"indices": [
		"identities"
	],
	"query": {
		"query": "*"
	},
    "sort": [
        "-name"
    ]
	}
	  `)
	resp, r, err := apiClient.Generic.DefaultAPI.GenericPost(ctx, "search/v1").RequestBody(map[string]interface{}{}).Execute()
	_ = searchString
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `SearchAPI.SearchPost`: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	b, _ := json.Marshal(resp)
	fmt.Fprintf(os.Stdout, "Search results: %v\n", string(b))
}

func getTransformResults(ctx context.Context, apiClient *sailpoint.APIClient) {
	resp, r, err := apiClient.TransformsAPI.ListTransformsV1(ctx).Execute()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `TransformsAPI.ListTransformsV1`: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	b, _ := json.Marshal(resp[0].Attributes)
	fmt.Fprintf(os.Stdout, "First response from `TransformsAPI.ListTransformsV1`: %v\n", string(b))
}

func getAllPaginatedResults(ctx context.Context, apiClient *sailpoint.APIClient) {
	resp, r, err := sailpoint.PaginateWithDefaults[api_accounts.Account](apiClient.AccountsAPI.ListAccountsV1(ctx))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Error when calling `AccountsAPI.ListAccountsV1`: %v\n", err)
		fmt.Fprintf(os.Stderr, "Full HTTP response: %v\n", r)
	}
	// response from `ListAccountsV1`: []Account
	fmt.Fprintf(os.Stdout, "First response from `AccountsAPI.ListAccountsV1`: %v\n", resp[0].Name)
}

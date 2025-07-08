# Polkadot Components

## Getting Started

```bash
pnpm i polkadot-api
npx papi add paseo_asset_hub -n paseo_asset_hub
```

## Todo

- [ ] We need a config with well known chains and enpoints predefined. find
      library that hosts rpc endpoints, chainspec for lightclients, if not
      found, host self?
- [ ] there is too many types in the config. move somewhere else
- [ ] when installing a component with the cli the config is not found as it is
      searched in @/components/polkadot-config instead of @/polkadot-config
- [ ] in the provider some functions need 2 params where it needs 1

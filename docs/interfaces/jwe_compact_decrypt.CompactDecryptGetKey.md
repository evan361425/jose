# Interface: CompactDecryptGetKey

## Callable

### CompactDecryptGetKey

▸ **CompactDecryptGetKey**(`protectedHeader`, `token`): `Promise`<[`KeyLike`](../types/types.KeyLike.md) \| `Uint8Array`\>

Interface for Compact JWE Decryption dynamic key resolution.
No token components have been verified at the time of this function call.

#### Parameters

| Name | Type |
| :------ | :------ |
| `protectedHeader` | [`JWEHeaderParameters`](types.JWEHeaderParameters.md) |
| `token` | [`FlattenedJWE`](types.FlattenedJWE.md) |

#### Returns

`Promise`<[`KeyLike`](../types/types.KeyLike.md) \| `Uint8Array`\>

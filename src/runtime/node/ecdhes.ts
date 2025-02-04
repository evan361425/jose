import type { KeyObject } from 'crypto'
import { diffieHellman, generateKeyPair as generateKeyPairCb } from 'crypto'
import { promisify } from 'util'

import type {
  EcdhAllowedFunction,
  EcdhESDeriveKeyFunction,
  GenerateEpkFunction,
} from '../interfaces.d'
import getNamedCurve from './get_named_curve.js'
import { encoder, concat, uint32be, lengthAndInput, concatKdf } from '../../lib/buffer_utils.js'
import digest from './digest.js'
import { JOSENotSupported } from '../../util/errors.js'
import { isCryptoKey, getKeyObject } from './webcrypto.js'
import isKeyObject from './is_key_object.js'
import invalidKeyInput from './invalid_key_input.js'

const generateKeyPair = promisify(generateKeyPairCb)

export const deriveKey: EcdhESDeriveKeyFunction = async (
  publicKee: unknown,
  privateKee: unknown,
  algorithm: string,
  keyLength: number,
  apu: Uint8Array = new Uint8Array(0),
  apv: Uint8Array = new Uint8Array(0),
) => {
  let publicKey: KeyObject
  if (isCryptoKey(publicKee)) {
    publicKey = getKeyObject(publicKee, 'ECDH-ES')
  } else if (isKeyObject(publicKee)) {
    publicKey = publicKee
  } else {
    throw new TypeError(invalidKeyInput(publicKee, 'KeyObject', 'CryptoKey'))
  }

  let privateKey: KeyObject
  if (isCryptoKey(privateKee)) {
    privateKey = getKeyObject(privateKee, 'ECDH-ES', new Set(['deriveBits', 'deriveKey']))
  } else if (isKeyObject(privateKee)) {
    privateKey = privateKee
  } else {
    throw new TypeError(invalidKeyInput(privateKee, 'KeyObject', 'CryptoKey'))
  }

  const value = concat(
    lengthAndInput(encoder.encode(algorithm)),
    lengthAndInput(apu),
    lengthAndInput(apv),
    uint32be(keyLength),
  )

  const sharedSecret = diffieHellman({ privateKey, publicKey })
  return concatKdf(digest, sharedSecret, keyLength, value)
}

export const generateEpk: GenerateEpkFunction = async (kee: unknown) => {
  let key: KeyObject
  if (isCryptoKey(kee)) {
    key = getKeyObject(kee)
  } else if (isKeyObject(kee)) {
    key = kee
  } else {
    throw new TypeError(invalidKeyInput(kee, 'KeyObject', 'CryptoKey'))
  }

  switch (key.asymmetricKeyType) {
    case 'x25519':
      return (await generateKeyPair('x25519')).privateKey
    case 'x448': {
      return (await generateKeyPair('x448')).privateKey
    }
    case 'ec': {
      const namedCurve = getNamedCurve(key)
      return (await generateKeyPair('ec', { namedCurve })).privateKey
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported EPK')
  }
}

export const ecdhAllowed: EcdhAllowedFunction = (key: unknown) =>
  ['P-256', 'P-384', 'P-521', 'X25519', 'X448'].includes(getNamedCurve(key))

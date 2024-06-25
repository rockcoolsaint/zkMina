import {
  Mina, PrivateKey, PublicKey, fetchAccount
} from 'o1js';
import { Add } from './Add.js';

const Network = Mina.Network("https://api.minascan.io/node/devnet/v1/graphql");

Mina.setActiveInstance(Network);

const appKey = PublicKey.fromBase58("B62qn1JsLQQ343QMCvv4amtrenZTSYuU76am5WSpi4QwLDtPE1YcUxY");

const zkApp = new Add(appKey);
await fetchAccount({ publicKey: appKey  });
console.log(zkApp.num.get().toString());

const accountPrivateKey = PrivateKey.fromBase58('EKDqN8mJCzmNEsE5mE3End7orM4S92p4jAmRWpKvBHH1hk4nhDLW');
const accountPublicKey = accountPrivateKey.toPublicKey();

// console.log('Account Public Key:', accountPublicKey.toBase58());

console.log('compiling...');
await Add.compile();

const tx = await Mina.transaction(
  { sender: accountPublicKey, fee: 0.1e9 },
  () => zkApp.update()
);

console.log('Proving...');
await tx.prove();

const sentTx = await tx.sign([accountPrivateKey]).send();

console.log('https://minascan.io/devnet/tx/' + sentTx.hash);

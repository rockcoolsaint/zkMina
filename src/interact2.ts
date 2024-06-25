import {
  Mina, PrivateKey, PublicKey, fetchAccount, AccountUpdate
} from 'o1js';
import { Add } from './Add.js';

const Local = Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

const {privateKey: deployerKey, publicKey: deployerAccount} = Local.testAccounts[0];
const {privateKey: senderKey, publicKey: senderAccount} = Local.testAccounts[1];

const zkAppPrivateKey = PrivateKey.random();
const zkAppAccount = zkAppPrivateKey.toPublicKey();
const zkApp = new Add(zkAppAccount);

console.log('compiling...');
await Add.compile()

const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  return zkApp.deploy();
});

await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

let num = zkApp.num.get();

console.log(num.toString());

const txn = await Mina.transaction(senderAccount, () => {
  zkApp.update();
});

console.log('Proving...');
await txn.prove();

await txn.sign([senderKey]).send();

num = zkApp.num.get();
console.log("updated state:", num.toString());
"use strict";

const fs = require('fs')
const crypto = require('crypto')
const contracts = JSON.parse(fs.readFileSync('./generated/contracts.json', 'utf8')).contracts
const chaithereum = require('chaithereum')
const web3 = chaithereum.web3
const chai = chaithereum.chai
const expect = chaithereum.chai.expect

let account
let accounts
let addresses

before(() => {
  return chaithereum.promise.then(() => {
    account = chaithereum.account
    accounts = chaithereum.accounts
  })
})

before(() => {
  return chaithereum.generateAddresses().then((_addresses) => {
    addresses = _addresses
  })
})

describe('QueueBot', () => {

  let queuebot
  let register

  it('should successfully instatiate queuebot', () => {
    return web3.eth.contract(JSON.parse(contracts.QueueBot.interface)).new.q(
      { data: contracts.QueueBot.bytecode }
    ).should.eventually.be.contract.then((_queuebot) => {
      queuebot = _queuebot
    })
  })

  it('should successfully instatiate register', () => {
    return web3.eth.contract(JSON.parse(contracts.Register.interface)).new.q(
      { data: contracts.Register.bytecode }
    ).should.eventually.be.contract.then((_register) => {
      register = _register
    })
  })

  it('queuebot should have correct owner', () => {
    return queuebot.owner.q().should.eventually.be.equal(account)
  })

  it('queuebot should be able to set owner to accounts[1]', () => {
    return queuebot.setOwner.q(accounts[1]).should.be.fulfilled
  })

  it('queuebot should NOT be able to set owner to accounts[1] (incorrect owner)', () => {
    return queuebot.setOwner.q(account).should.be.rejected
  })

  it('queuebot should be able to set owner to account', () => {
    return queuebot.setOwner.q(account, { from: accounts[1] }).should.be.fulfilled
  })

  it('register should have "a","b","c","d","e" set to 0', () => {
    return web3.Q.all([
      register.a.q().should.eventually.be.bignumber.equal(0),
      register.b.q().should.eventually.be.bignumber.equal(0),
      register.c.q().should.eventually.be.bignumber.equal(0),
      register.d.q().should.eventually.be.bignumber.equal(0),
      register.e.q().should.eventually.be.bignumber.equal(0)
    ]).should.be.fulfilled
  })

  it('should NOT be able to set "a" to 1 (incorrect owner)', () => {
    const calldataA = register.setA.getData(1)
    return queuebot.queue.q([register.address], [0], [calldataA.length/2 - 1], calldataA, { from: accounts[1] }).should.be.rejected
  })

  it('should be able to set "a" to 1', () => {
    const calldataA = register.setA.getData(1)
    return queuebot.queue.q([register.address], [0], [calldataA.length/2 - 1], calldataA).should.be.fulfilled
  })

  it('register should have "a" set to 1', () => {
    return register.a.q().should.eventually.be.bignumber.equal(1)
  })

  it('should be able to set "b","c" to 2', () => {
    const calldataB = register.setB.getData(2)
    const calldataC = register.setC.getData(2)
    const gluedCalldata = `0x${calldataB.substr(2)}${calldataC.substr(2)}`

    return queuebot.queue.q(
      [register.address, register.address],
      [0, 0],
      [calldataB.length / 2 - 1, calldataC.length / 2 - 1],
      gluedCalldata
    ).should.be.fulfilled
  })

  it('register should have "b","c" set to 2', () => {
    return web3.Q.all([
      register.b.q().should.eventually.be.bignumber.equal(2),
      register.c.q().should.eventually.be.bignumber.equal(2)
    ]).should.be.fulfilled
  })

  it('should NOT be able to set "d","e" to 3 with value 3 each (failure to fund)', () => {
    const calldataD = register.setD.getData(3)
    const calldataE = register.setE.getData(3)
    const gluedCalldata = `0x${calldataD.substr(2)}${calldataE.substr(2)}`

    return queuebot.queue.q(
      [register.address, register.address],
      [3, 3],
      [calldataD.length / 2 - 1, calldataE.length / 2 - 1],
      gluedCalldata
    ).should.be.rejected
  })

  it('should be able to set "d","e" to 3 with value 3 each', () => {
    const calldataD = register.setD.getData(3)
    const calldataE = register.setE.getData(3)
    const gluedCalldata = `0x${calldataD.substr(2)}${calldataE.substr(2)}`

    return queuebot.queue.q(
      [register.address, register.address],
      [3, 3],
      [calldataD.length / 2 - 1, calldataE.length / 2 - 1],
      gluedCalldata,
      { value: 6 }
    ).should.be.fulfilled
  })

  it('register should have "d","e" set to 3', () => {
    return web3.Q.all([
      register.d.q().should.eventually.be.bignumber.equal(3),
      register.e.q().should.eventually.be.bignumber.equal(3)
    ]).should.be.fulfilled
  })

  it('register should balance of 6', () => {
    return web3.eth.getBalance.q(register.address).should.eventually.be.bignumber.equal(6)
  })

})
import { assert } from 'chai'
import { TestContractHandler } from '../../TestContractHandler'
import { DataTokens } from '../../../src/datatokens/Datatokens'
import { FixedPriceLP } from '../../../src/datatokens/FixedPriceLP'

const Web3 = require('web3')
const web3 = new Web3('http://127.0.0.1:8545')
const factory = require('@oceanprotocol/contracts/artifacts/development/DTFactory.json')
const datatokensTemplate = require('@oceanprotocol/contracts/artifacts/development/DataTokenTemplate.json')
const defaultFPLPABI = require('@oceanprotocol/contracts/artifacts/development/FLFPTemplate.json')

describe('Fixed Price Liquidity Provider flow', () => {
    let oceanTokenAddress
    let fplp
    let fplpAddress
    let owner
    let bob
    let alice
    let contracts
    let datatoken
    let tokenAddress
    let consoleDebug: false
    const blob = 'http://localhost:8030/api/v1/services/consume'
    describe('#test', () => {
        before(async () => {
            // deploy DT Factory
            contracts = new TestContractHandler(
                factory.abi,
                datatokensTemplate.abi,
                datatokensTemplate.bytecode,
                factory.bytecode,
                web3
            )
            await contracts.getAccounts()
            owner = contracts.accounts[0]
            alice = contracts.accounts[1]
            bob = contracts.accounts[2]
            await contracts.deployContracts(owner)

            // initialize DataTokens
            datatoken = new DataTokens(
                contracts.factoryAddress,
                factory.abi,
                datatokensTemplate.abi,
                web3
            )
            assert(datatoken !== null)
        })

        it('Alice should create datatokens smart contract', async () => {
            tokenAddress = await datatoken.create(blob, alice)
            assert(tokenAddress !== null)
        })
        it('Bob should create a dummy OceanToken', async () => {
            oceanTokenAddress = await datatoken.create(blob, bob)
            assert(oceanTokenAddress !== null)
        })
        it('Alice should create a FPLP', async () => {
            // Alice creates FPLP with exchange ratio of 1
            fplp = new FixedPriceLP(
                contracts.factoryAddress,
                oceanTokenAddress,
                factory.abi,
                defaultFPLPABI,
                web3
            )
            fplpAddress = await fplp.create(alice, tokenAddress, '1')
        })

        it('Alice should mint some datatokens', async () => {})
        it('Bob should mint some dummy Ocean tokens', async () => {})

        it('Alice should allow FPLP contract to spend datatokens', async () => {})

        it('Bob should buy DataTokens using the FPLP contract', async () => {})

        it('Bob should have 1 DT in his wallet', async () => {})
        it('Alice should have 1 basetoken in her wallet', async () => {})
        it('Alice should change the ratio using the FPLP contract', async () => {})
        it('Bob should buy DataTokens using the FPLP contract', async () => {})

        it('Bob should have 2 more DT in his wallet', async () => {})
        it('Alice should have 2 more basetoken in her wallet', async () => {})
    })
})

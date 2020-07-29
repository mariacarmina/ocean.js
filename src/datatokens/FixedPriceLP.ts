const defaultFactoryABI = require('@oceanprotocol/contracts/artifacts/development/DTFactory.json')
const defaultFPLPABI = require('@oceanprotocol/contracts/artifacts/development/FLFPTemplate.json')

/**
 * Provides a interface to Fixed Price Liquidity Provider contract
 */
export class FixedPriceLP {
    public factoryAddress: string
    public factoryABI: any
    public FPLPABI: any
    public web3: any
    public oceanAddress: string = null

    /**
     * Instantiate FPLP (independently of Ocean).
     * @param {String} factoryAddress
     * @param {any} factoryABI
     * @param {any} FPLPABI
     * @param {any} web3 
     
     */
    constructor(
        factoryAddress: string,
        oceanAddress: string,
        factoryABI: any,
        FPLPABI: any,
        web3: any
    ) {
        this.factoryAddress = factoryAddress
        this.oceanAddress = oceanAddress
        this.factoryABI = factoryABI || defaultFactoryABI.abi
        this.FPLPABI = FPLPABI || defaultFPLPABI.abi
        this.web3 = web3
    }

    /**
     * Create new Fixed Price Contract
     * @param {String} account
     * @param {String} datatoken  Datatoken address
     * @param {String} ratio exchange rate (IE: How many basetokens are required to get a DataToken)
     * @return {Promise<string>} FPLP Contract address
     */
    public async create(
        account: string,
        datatoken: string,
        ratio: string
    ): Promise<string> {
        // Create factory contract object
        const factory = new this.web3.eth.Contract(this.factoryABI, this.factoryAddress, {
            from: account
        })
        const estGas = await factory.methods
            .createFPLP(
                account,
                this.oceanAddress,
                datatoken,
                this.web3.utils.toWei(ratio)
            )
            .estimateGas(function (err, estGas) {
                if (err) console.log('FixedPriceLP: ' + err)
                return estGas
            })

        const trxReceipt = await factory.methods
            .createFPLP(
                account,
                this.oceanAddress,
                datatoken,
                this.web3.utils.toWei(ratio)
            )
            .send({
                from: account,
                gas: estGas + 1,
                gasPrice: '3000000000'
            })

        let tokenAddress = null
        try {
            tokenAddress = trxReceipt.events.FPLPCreated.returnValues[0]
        } catch (e) {
            console.error(e)
        }
        return tokenAddress
    }

    /**
     * Buy DataTokens
     * @param {String} account
     * @param {String} contractAddress  - FPLP contract address
     * @param {String} amount Amount of data tokens to buy
     * @return {Promise<string>} transactionId
     */
    public async buyDataTokens(
        account: string,
        contractAddress: string,
        amount: string
    ): Promise<string> {
        const fplpContract = new this.web3.eth.Contract(this.FPLPABI, contractAddress, {
            from: account
        })
        const trxReceipt = await fplpContract.methods
            .buyDataTokens(this.web3.utils.toWei(amount))
            .send({ from: account })
        return trxReceipt
    }

    /**
     * Set a new exchange rate
     * @param {String} account
     * @param {String} contractAddress  - FPLP contract address
     * @param {String} ratio New exchange rate
     * @return {Promise<string>} transactionId
     */
    public async setRatio(
        account: string,
        contractAddress: string,
        ratio: string
    ): Promise<string> {
        const fplpContract = new this.web3.eth.Contract(this.FPLPABI, contractAddress, {
            from: account
        })
        const trxReceipt = await fplpContract.methods
            .setRatio(this.web3.utils.toWei(ratio))
            .send({ from: account })
        return trxReceipt
    }

    /**
     * Get exchange rate
     * @param {String} account
     * @param {String} contractAddress  - FPLP contract address
     * @return {Promise<string>} exchange rate
     */
    public async getRatio(account: string, contractAddress: string): Promise<string> {
        const fplpContract = new this.web3.eth.Contract(this.FPLPABI, contractAddress, {
            from: account
        })
        const ratio = await fplpContract.methods.getRatio().call({ from: account })
        return this.web3.utils.fromWei(ratio)
    }

    /**
     * Get list of tokens
     * @param {String} account
     * @param {String} contractAddress  - FPLP contract address
     * @return {Promise<string[]>} token list
     */
    public async getTokens(account: string, contractAddress: string): Promise<string[]> {
        const fplpContract = new this.web3.eth.Contract(this.FPLPABI, contractAddress, {
            from: account
        })
        const ratio = await fplpContract.methods.getTokens().call({ from: account })
        return ratio
    }

    /**
     * Get available Data Token amount that can be exchanged
     * @param {String} account
     * @param {String} contractAddress  - FPLP contract address
     * @return {Promise<string>} Amount
     */
    public async getDTReserve(
        account: string,
        contractAddress: string
    ): Promise<string[]> {
        const fplpContract = new this.web3.eth.Contract(this.FPLPABI, contractAddress, {
            from: account
        })
        const reserve = await fplpContract.methods.getDTReserve().call({ from: account })
        return this.web3.utils.fromWei(reserve)
    }

    /**
     * Search all contracts that provides exchange for a DT
     * @param {String} account
     * @param {String} dtAddress
     * @return {String[]}
     */
    public async searchFPLPforDT(account: string, dtAddress: string): Promise<string[]> {
        const result: string[] = []
        const factory = new this.web3.eth.Contract(this.factoryABI, this.factoryAddress, {
            from: account
        })
        const events = await factory.getPastEvents('FPLPCreated', {
            filter: { datatoken: dtAddress },
            fromBlock: 0,
            toBlock: 'latest'
        })
        console.log(events)
        for (let i = 0; i < events.length; i++) {
            result.push(events[i].returnValues[0])
        }
        return result
    }
}

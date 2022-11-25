const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { parseEther, formatEther } = require("ethers/lib/utils");
const { ethers, waffle } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Knowledge Test", function () {
   //Deploy test fixture

  async function deployTokenFixture() {
    const ContractFactory = await ethers.getContractFactory("KnowledgeTest");
    const [owner, addr1, addr2] = await ethers.getSigners();

    const contract = await ContractFactory.connect(owner).deploy();
    // await contract.deployed()


    return {ContractFactory,contract, owner, addr1, addr2};
    console.log("Deploy Fixture:", ContractFactory,contract, owner, addr1,addr2);
  }
  
  
    // Declaring outside of the tests to have access inside them
//   let owner, addr1, addr2, addrs, lottery;
//   let provider = waffle.provider;
//   beforeEach(async () => {
//     [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
//     const Knowledge = await ethers.getContractFactory("KnowledgeTest");

//     // Hardhat always deploys with the first address from getSigners(), but we'll be explicit here
//     contract = await Knowledge.connect(owner).deploy();
//     console.log("Contract Address:", contract.address);
//   });    

  it("Has an owner variable that is public and equal to owner", async () => {
    const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);
    const tx = await contract.owner();
    expect(tx).to.equal(owner.address);
    expect(tx).to.not.equal(addr1.address);

  });

  it("Initializes the owner variable to the deployer, checks to see if not equal to another address", async () => {
    const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);

    const contractOwner = await contract.owner();
    expect(contractOwner).to.be.eq(owner.address);
  });

    it("Has a public variable called tokens and checks its values", async() => {
        const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);
        const tok0 = await contract.tokens(0);
        const tok1 = await contract.tokens(1);
        expect(tok0).to.equal("BTC");
        expect(tok1).to.equal("ETH");
           
    });

  it("changeTokens() changes the state of the variable 'tokens', check values before and after change", async () => {
    const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);
    const tokens = await contract.changeTokens();
    expect(await contract.tokens(0)).to.not.equal("BTC");
    expect(await contract.tokens(0)).to.equal("VET");
    expect(await contract.tokens(1)).to.equal("ETH");
  });

    it("Test getBalance() function.Sender transfers to contract, check sender's balance and contract balance", async()=> {
        const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);

        expect(await ethers.provider.getBalance(contract.address)).to.equal(0);
        await expect(() =>
        addr1.sendTransaction({ to: contract.address, value: 1 })
        ).to.changeEtherBalance(addr1, "-1");
        expect(await ethers.provider.getBalance(contract.address)).to.equal(1);
        console.log("ethers.provider.getBalance(contract.address):", await ethers.provider.getBalance(contract.address));
        // console.log("contract.getBalance():",contract.balance);
        expect(await contract.getBalance()).to.equal(1);
        expect(await ethers.provider.getBalance(contract.address)).to.equal(await contract.getBalance());


    })

    it("Check transferAll() function: Contract transfer entire balance to sender", async() => {
        const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);

        await expect(() =>
        addr1.sendTransaction({ to: contract.address, value: 1 })
        ).to.changeEtherBalance(addr1, "-1");
        const cont_bal = await ethers.provider.getBalance(contract.address);
        console.log("contract bal:", await ethers.provider.getBalance(contract.address));
        
        await expect(
            contract.transferAll(addr2.address)
        ).not.to.be.revertedWith("ONLY_OWNER");
        expect(await ethers.provider.getBalance(contract.address)).to.equal(0);

    })


  it("Only owner can invoke transferAll()", async()=> {

    const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);
    await expect(
        contract.connect(addr2).transferAll(addr1.address)
    ).to.be.revertedWith("ONLY_OWNER");
  })


//   it("transferAll() sends all the ether in the contract to another address", async () => {
//     const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);

//     await addr1.sendTransaction({
//       to: contract.address,
//       value: parseEther("0.1"),
//     });

//     await expect(
//       await contract.transferAll(addr2.address)
//     ).to.changeEtherBalances(
//       [contract, addr2],
//       [parseEther("-0.1"), parseEther("0.1")]
//     );
//   });

  it("Only owner can call transferAll()", async () => {
        const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);

    await expect(
      contract.connect(addr1).transferAll(addr1.address)
    ).to.be.revertedWith("ONLY_OWNER");
  });

  it("start() adds the calling address to 'players'", async () => {
    const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);

    await contract.start();
    await contract.connect(addr1).start();
    await contract.connect(addr2).start();
    const firstPlayer = await contract.players(0);
    const secondPlayer = await contract.players(1);
    const thirdPlayer = await contract.players(2);

    expect(firstPlayer).to.be.eq(owner.address);
    expect(secondPlayer).to.be.eq(addr1.address);
    expect(thirdPlayer).to.be.eq(addr2.address);

  });

  if("Concatenates two strings",async() => {
    const {ContractFactory,contract,owner, addr1,addr2} = await loadFixture(deployTokenFixture);
    expect(await contract.concatenate("Sand","Man")).to.equal("SandMan");

  });


});

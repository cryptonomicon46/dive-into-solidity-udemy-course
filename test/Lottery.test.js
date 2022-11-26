const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { parseEther, formatEther } = require("ethers/lib/utils");
const { ethers, waffle } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");


describe("Lottery Contract", function () {
//   let owner, addr1, addr2, lottery;
//   let provider = waffle.provider;

  async function deployLotteryFixture() {
    const LotteryFactory = await ethers.getContractFactory("Lottery");
    [owner, addr1, addr2,addr3, ...addrs] = await ethers.getSigners();
    const lottery = await LotteryFactory.connect(owner).deploy();
    return {LotteryFactory,lottery, owner, addr1, addr2,addr3};

    console.log("Contract deployed at ", contract.address);
  }

  beforeEach(async () => {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    // const Lottery = await ethers.getContractFactory("Lottery");

    // Hardhat always deploys with the first address from getSigners(), but we'll be explicit here
    // lottery = await Lottery.connect(owner).deploy();
  });

//   describe("Only owner", () => {
    it("Only owner can pick a winner", async () => {
        const {LotteryFactory,lottery,owner, addr1,addr2,addr3} = await loadFixture(deployLotteryFixture);

      await expect(lottery.connect(addr1).pickWinner()).to.be.revertedWith(
        "ONLY_OWNER"
      );
       
    });



    it("Check for invalid entry fee", async() => {
        const {LotteryFactory,lottery,owner, addr1,addr2,addr3} = await loadFixture(deployLotteryFixture);
        await expect(addr1.sendTransaction({to: lottery.address, value: parseEther("2")})).
        to.be.revertedWith("INVALID_ENTRY_FEE");
    })

    it("Allow a valid entry fee", async() => {
        const {LotteryFactory,lottery,owner, addr1,addr2,addr3} = await loadFixture(deployLotteryFixture);
        await (addr1.sendTransaction({to: lottery.address, value: parseEther("0.1")}));
        // .not.to.be.reverted;
        // const cont_bal = await ethers.provider.getBalance(lottery.address);

        let contract_bal = await lottery.connect(owner).getBalance();
        expect(contract_bal).to.be.equal(parseEther("0.1"));

    })


    it("Can't pick a winner with insufficient players", async()=> {
        const {LotteryFactory,lottery,owner, addr1, addr2,addr3} = await loadFixture(deployLotteryFixture);
        await (addr1.sendTransaction({to: lottery.address, value: parseEther("0.1")}));
        await (addr1.sendTransaction({to: lottery.address, value: parseEther("0.1")}));
        await expect(lottery.connect(owner).pickWinner()).to.be.revertedWith("NOT_ENOUGH_PLAYERS");


    });
    
    it("Can pick a winner with sufficient players", async()=> {
        const {LotteryFactory,lottery,owner, addr1, addr2,addr3} = await loadFixture(deployLotteryFixture);

        for ( i =1; i<4 ; i++) {
            await addrs[i].sendTransaction({
                to: lottery.address,
                value: parseEther("0.1")
            })
        }
        let contract_bal = await lottery.getBalance();
        expect(contract_bal).to.equal(parseEther("0.3")); 

    });

    it("Playing...", async()=> {
        const {LotteryFactory,lottery,owner, addr1, addr2,addr3} = await loadFixture(deployLotteryFixture);

        for ( i =0; i<=3 ; i++) {
            await addrs[i].sendTransaction({
                to: lottery.address,
                value: parseEther("0.1")
            })
        }
        // console.log("addresses\n",addrs.slice(0,3).map(p => p.address));
        const addrs_ = addrs.slice(0,3).map(p => p.address);
   

        await expect(lottery.connect(owner).pickWinner()).not.to.be.reverted;
        
        const winner = await lottery.gameWinners(0);
        console.log(addrs_);
        expect(addrs_).to.deep.include(winner);
        const winner_balance = await ethers.provider.getBalance(winner);

 
        expect(winner_balance.gt(BigNumber.from(parseEther("10000")))).to.be.true;
        // Expect that players array is empty
        expect(await lottery.players.length).to.be.equal(0);
        



    });


    // it("Check for valid entry fee and contract balance", async() => {
    //     const {LotteryFactory,lottery,owner, addr1,addr2,addr3} = await loadFixture(deployLotteryFixture);
    //    await addr1.sendTransaction({to: lottery.address, value: 0.1})
    //     // await expect(addr1.sendTransaction({to: lottery.address, value: ethers.0.1})).
    //     // not.to.be.reverted; 
    //     // await expect(addr2.sendTransaction({to: lottery.address, value: 0.1})).
    //     // not.to.be.reverted; 
    //     // await expect(addr3.sendTransaction({to: lottery.address, value: 0.1})).
    //     // not.to.be.reverted; 

    //     // await expect(contract.connect(owner).getBalance).to.equal(0.3);
        // await expect(contract.connnect(addr1).getBalance).to.be.revertedWith("ONLY_OWNER");
    // })



//     it("Only owner can call getBalance", async () => {
//       await expect(lottery.connect(addr1).getBalance()).to.be.revertedWith(
//         "ONLY_OWNER"
//       );
//     });
//   });

//   describe("Playing", () => {
//     it("Allows a player to enter", async () => {
//       await addr1.sendTransaction({
//         to: lottery.address,
//         // parseEther("0.1") will return "100000000000000000" (which is the equivalent in wei)
//         value: parseEther("0.1"),
//       });

//       // Checking if the contract's balance increased
//       const newBalance = await lottery.getBalance();
//       expect(newBalance).to.be.equal(parseEther("0.1"));

//       // Public getters generated for arrays require an index to be passed, so we'll check the 0 index (where this new player should be)
//       const newPlayer = await lottery.players(0);
//       expect(newPlayer).to.be.equal(addr1.address);
//     });

//     it("Can't pick a winner if less than 3 players", async () => {
//       await addr1.sendTransaction({
//         to: lottery.address,
//         value: parseEther("0.1"),
//       });
//       await addr2.sendTransaction({
//         to: lottery.address,
//         value: parseEther("0.1"),
//       });
//       await expect(lottery.pickWinner()).to.be.revertedWith(
//         "NOT_ENOUGH_PLAYERS"
//       );
//     });

//     it("Can pick a winner and winner gets paid", async () => {
//       // Make 4 players enter the game
//       for (let i = 0; i < 4; i++) {
//         await addrs[i].sendTransaction({
//           to: lottery.address,
//           value: parseEther("0.1"),
//         });
//       }

//       await lottery.pickWinner();
//       const winner = await lottery.gameWinners(0);

//       // The winner should be one of the 4 players
//       expect(addrs.slice(0, 4).map((player) => player.address)).to.include(
//         winner
//       );

//       const winnerBalance = await provider.getBalance(winner);
//       // With hardhat, by default, all test signers have 10000 ETH, so we check if the winner has more than that
//       expect(winnerBalance.gt(BigNumber.from(parseEther("10000")))).to.be.true;
//       // Expect that players array is empty
//       expect(await lottery.players.length).to.be.equal(0);
//     });

//     it("After winner is picked, then players array is reset", async () => {
//       // Make 4 players enter the game
//       for (let i = 0; i < 4; i++) {
//         await addrs[i].sendTransaction({
//           to: lottery.address,
//           value: parseEther("0.1"),
//         });
//       }

//       await lottery.pickWinner();
//       const winner = await lottery.gameWinners(0);

//       // Expect that players array is empty
//       expect(await lottery.players.length).to.be.equal(0);
//     });
//   });
});

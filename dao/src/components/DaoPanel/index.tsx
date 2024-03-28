import React, { useContext, useState, useEffect } from 'react';
import { useChain } from "@cosmos-kit/react";
import { CoreumSigner } from "@/contexts/CoreumSigner";
import { Tab} from "@headlessui/react";
import { chainName, PUBLIC_RPC_ENDPOINT} from "@/config/defaults";
import { Box, GovernanceProposalItem } from '@interchain-ui/react';
import { StdFee } from '@cosmjs/amino';

import { CosmWasmClient, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function DaoPanel(){

  const [selectedTab, setSelectedTab] = useState('Propose'); 


  const [proposals, setProposals] = useState<any[]>([]);  // State to store proposals
  const [members, setMembers] = useState<any[]>([]);  // State to store proposals

  const [proposalId, setProposalId] = useState(0);  // State to store the proposal id

  const [proposal, setProposal] = useState({ title: '', date: '', description: '' });  // State to store the form data

  const [proposalData, setProposalData] = useState({
    title: '',
    description: '',
    amount: ''
  });
  
  const contractAddress = 'testcore15rdlncz75zf2txgue52zcmm4jh6hxr5gejmavnxnr2rxh8a5jyjqgypktm'; 
  //const rpcEndpoint = 'https://full-node.testnet-1.coreum.dev:26657';

  const chainContext = useChain(chainName);
  const rpcEndpoint = 'https://full-node.mainnet-1.coreum.dev:26657';

  
  const walletAddress = chainContext.address ?? "";

  //const walletAddress = "testcore1288r0lprw9dqdqenfk2s7gamqt37nqmxxrt9w3";


  //pull this from the config file
  //const rpcEndpoint = 'wss://coreum-rpc.publicnode.com:443/websocket'; //is this the right rpc? https://coreum-rpc.publicnode.com/
  //const rpcEndpoint = PUBLIC_RPC_ENDPOINT;

  const [cwClient, setCwClient] = useState(null);

  const fee: StdFee = {
    amount: [{ denom: "ucore", amount: "6084" }],
    gas: "120000",
  };
  
  const tabContents = {
    Propose: {
      title: 'Create A Proposal',
      description: 'Create a new proposal for an upcoming workshop.'
    },
    Vote: {
      title: 'Vote on Proposals',
      description: 'Participate in the decision making process by voting on active proposals for workshops.'
    },
    Results: {
      title: 'View Results',
      description: 'Check out the results of past proposals for workshops.'
    }
  };

const coreumSigner = useContext(CoreumSigner);

// Function to handle button click
const handleButtonClick = () => {
  // Construct denom dynamically
  console.log("Proposal Entered:");

};

useEffect(() => {
  handleButtonClick();
  const initCosmWasmClient = async () => {
    const client = await CosmWasmClient.connect(rpcEndpoint);
    setCwClient(client);
    console.log('CosmWasm Client:', client);
    console.log('Wallet Address:', walletAddress);
    console.log('Contract Address:', contractAddress);
  };

  initCosmWasmClient();
}, []);


//docs https://cosmos.github.io/cosmjs/latest/cosmwasm-stargate/classes/SigningCosmWasmClient.html
//query messages 
//we need to get data from this contract so console.log the response
const getMembers = async () => {
  if (!cwClient) return;
  try {
      const queryMsg = { list_members: {} };
      const response = await cwClient.queryContractSmart(contractAddress, queryMsg);
      console.log('Query Response:', response);

      if (response && Array.isArray(response)) {
          setMembers(response);
      }
  } catch (error) {
      console.error('Error querying contract:', error);
  }
};

//when we click to the vote tab I want to query all proposals
const queryAllProposals = async () => {
  if (!cwClient) return;
  try {
      const queryMsg = { list_proposals: {} };
      const response = await cwClient.queryContractSmart(contractAddress, queryMsg);
      console.log('Query Response:', response);

      if (response && Array.isArray(response)) {
          setProposals(response);
      }
  } catch (error) {
      console.error('Error querying contract:', error);
  }
};

//query one proposal 
const queryProposal = async (proposalId) => {
  if (!cwClient) return;
  try {
      const queryMsg = { get_proposal: { proposal_id: proposalId } };
      const response = await cwClient.queryContractSmart(contractAddress, queryMsg);
      console.log('Query Response:', response);

      if (response) {
          setProposal(response);
      }
  } catch (error) {
      console.error('Error querying contract for a proposal:', error);
  }
};


//executables https://cosmos.github.io/cosmjs/latest/cosmwasm-stargate/classes/SigningCosmWasmClient.html
const propose = async (title, description, amount) => {
  //if (!chainContext.client || !walletAddress) return;
  try {
    const executeMsg = { 
      propose: { 
        title, 
        description, 
        walletAddress, 
        amount //put in the date instead of amount
      } 
    };
    //const fee = { amount: [{ denom: 'ucosm', amount: '5000' }], gas: '200000' };
    //const signer = await coreumSigner.getSigner();
    const signingClient = new SigningCosmWasmClient(rpcEndpoint, walletAddress, coreumSigner);

    console.log('Execute Message:', executeMsg);
    console.log('signing client', signingClient);

    const response = await signingClient.execute(walletAddress, contractAddress, executeMsg, fee);
    console.log('Execute Response:', response);
  } catch (error) {
    console.error('Error executing contract:', error);
  }
};

const vote = async (proposalId, approve) => {
  if (!chainContext.client || !walletAddress) return;
  try {
    const executeMsg = { 
      vote: { 
        proposal_id: proposalId, 
        approve 
      } 
    };
    //const fee = { amount: [{ denom: 'ucosm', amount: '5000' }], gas: '200000' }; 
    //const signer = await coreumSigner.getSigner();
    const signingClient = new SigningCosmWasmClient(rpcEndpoint, walletAddress, coreumSigner);
    const response = await signingClient.execute(walletAddress, contractAddress, executeMsg, fee);
    console.log('Execute Response:', response);
  } catch (error) {
    console.error('Error executing contract:', error);
  }
};

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Tab Component */}
      <div className="w-full max-w-md px-2 py-16 sm:px-0">
        <Tab.Group onChange={(index) => setSelectedTab(Object.keys(tabContents)[index])}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {Object.keys(tabContents).map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-center',
                    'ring-white ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected ? 'bg-white shadow text-blue-700' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
      </div>

  {/* Dynamic Content Area */}
  <div className="mx-4 md:mx-12 lg:mx-24 xl:mx-48 2xl:mx-72 my-10 p-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl text-gray-100 transition-all duration-500 ease-in-out transform hover:scale-105">
      <div className="flex flex-col items-center">
        <h2 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 hover:text-green-300">
            {tabContents[selectedTab].title}
          </h2>
        <p className="text-center mb-6">{tabContents[selectedTab].description}</p>
  </div>

  {selectedTab === 'Propose' && (
  <div className="mx-4 md:mx-12 lg:mx-24 xl:mx-48 2xl:mx-72 my-10 p-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl text-gray-100 transition-all duration-500 ease-in-out transform hover:scale-105">
    <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 hover:text-green-300">
      Propose A Future Workshop
    </h2>
    <form 
      className="mt-4 space-y-3" 
      autoComplete="off"
      onSubmit={async (e) => {
        e.preventDefault();
        await propose(proposalData.title, proposalData.description,  proposalData.amount);
        alert('Proposal has been submitted successfully.');
        // Reset form after submission
        setProposalData({ title: '', description: '',  amount: '' });
      }}
    >
      <input
        name="title"
        type="text"
        placeholder="Title"
        value={proposalData.title}
        onChange={(e) => setProposalData({ ...proposalData, title: e.target.value })}
        className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={proposalData.description}
        onChange={(e) => setProposalData({ ...proposalData, description: e.target.value })}
        className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      ></textarea>
      <input
        name="date"
        type="number"
        placeholder="Date"
        value={proposalData.amount}
        onChange={(e) => setProposalData({ ...proposalData, amount: e.target.value })}
        className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        required
      />
      <button
        type="submit"
        className="px-6 py-2 font-semibold text-white rounded-lg shadow-lg bg-gradient-to-r from-teal-300 to-cyan-500 hover:from-teal-400 hover:to-cyan-600 transition ease-in-out duration-300"
      >
        Submit Proposal
      </button>
      <button
        type="button" // Make sure this is of type 'button' so it doesn't submit the form
        onClick={queryAllProposals} // Trigger the function to query all proposals
        className="px-6 py-2 font-semibold text-white rounded-lg shadow-lg bg-gradient-to-r from-blue-300 to-indigo-500 hover:from-blue-400 hover:to-indigo-600 transition ease-in-out duration-300"
      >
        Query All Proposals
      </button>
      <input
        type="number"
        placeholder="Proposal ID"
        value={proposalId}
        onChange={(e) => setProposalId(Number(e.target.value))}
        className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button
        type="button" // Again, of type 'button'
        onClick={() => queryProposal(proposalId)} // Trigger the function to query a specific proposal by ID
        className="px-6 py-2 font-semibold text-white rounded-lg shadow-lg bg-gradient-to-r from-purple-300 to-pink-500 hover:from-purple-400 hover:to-pink-600 transition ease-in-out duration-300"
      >
        Query Proposal by ID
      </button>
    </form>
  </div>
)}

{selectedTab === 'Vote' && (
  <div>
    {proposals.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 my-10">
        {proposals.map((proposal, index) => (
          <div key={proposal.id} className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl text-gray-100 transition-all duration-500 ease-in-out transform hover:scale-105">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 hover:text-green-300">
              {proposal.title}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <p>{proposal.date}</p>
                <p>{proposal.description}</p>
                <div className="flex space-x-4">
                  <button 
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition ease-in-out duration-300"
                    onClick={() => {
                      // Here, you can handle the confirmation action
                      alert('Confirmed');
                    }}
                  >
                    Yes
                  </button>
                  <button 
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition ease-in-out duration-300"
                    onClick={() => {
                      const updatedProposals = proposals.filter((_, idx) => idx !== index);
                      setProposals(updatedProposals);
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-500">No active proposals.</p>
    )}
  </div>
)}


{selectedTab === 'Results' && (
  <div>
    {proposals.length > 0 ? (
      // Adjust grid container spacing and layout
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {proposals.map((proposal) => (
          // Add minimum height and control overflow
          <div key={proposal.id} className="min-h-[250px] p-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl text-gray-100 transition-all duration-500 ease-in-out transform hover:scale-105 overflow-hidden">
            <Box>
              <GovernanceProposalItem
                status='passed'
                title='DAO Workshop '
                id='#00120'
                endTime=' 2022-01-11 10:48 '
                votes={{
                  yes: 650,
                  no: 200,
                  abstain: 400,
                  noWithVeto: 34,
                }}
              />
            </Box>
          </div>
        ))}
      </div>
    ) : (
      // Display message when there are no active proposals
      <p className="text-center text-gray-500">No active proposals.</p>
    )}
  </div>
)}


</div>
</div>
  );
}
export default DaoPanel;


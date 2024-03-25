import React, { useContext, useState, useEffect } from 'react';
import { useChain } from "@cosmos-kit/react";
import { StdFee } from "@cosmjs/amino";
import { CoreumSigner } from "@/contexts/CoreumSigner";
import { Switch, Listbox, Transition, Tab} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { assets, ibc, chains } from "chain-registry";
import { chainName } from "@/config/defaults";
import { Fragment } from 'react';
import { MsgSendEncodeObject } from "@cosmjs/stargate/build/modules";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { Coin } from "coreum-js/dist/main/cosmos/base/v1beta1/coin";
import { Height } from "cosmjs-types/ibc/core/client/v1/client";
import Long from "long";
import crypto from 'crypto'; // Import crypto module for SHA256 hashing

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function SendFTWithTheme() {
  const [response, setResponse] = useState<any>("");
  const [error, setError] = useState<any>("");

  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [denom, setDenom] = useState("");

  const [selectedFilter, setSelectedFilter] = useState('Recent');


  const [isIBCEnable, setIBCEnable] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Propose'); // New state for tracking the selected tab


  const [proposals, setProposals] = useState<any[]>([]);  // State to store proposals
  const chainContext = useChain(chainName);
  const walletAddress = chainContext.address ?? "";

  const tabContents = {
    Propose: {
      title: 'Create A Proposal',
      description: 'Create a new proposal for others to vote on.'
    },
    Vote: {
      title: 'Vote on Proposals',
      description: 'Participate in the decision making process by voting on active proposals.'
    },
    Results: {
      title: 'View Results',
      description: 'Check out the results of past proposals.'
    }
  };




  //the smart contract has to store proposals and we need to query the amount of pending proposals from the cotnract 
const coreumSigner = useContext(CoreumSigner);


  // Function to compute SHA256 hash
const hash = (input : any) => {
  return crypto.createHash('sha256').update(input).digest('hex');
};

// Function to handle button click
const handleButtonClick = () => {
  // Construct denom dynamically
  console.log("Proposal Entered:");

};

useEffect(() => {
  // Call handleButtonClick when the component mounts
  handleButtonClick();
});



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


{selectedTab === 'Vote' && (
         
  <div className="flex items-center justify-center mb-4">
    <Switch
      checked={isIBCEnable}
      onChange={setIBCEnable}
      className={`${isIBCEnable ? 'bg-green-500' : 'bg-gray-700'} relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none`}
    >
      <span className="sr-only">Filter</span>
      <span
        className={`${isIBCEnable ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`}
      />
    </Switch>
    <span className="ml-3 text-sm font-medium">Filter</span>
  </div>
)}

  {isIBCEnable && (
    <div className="relative w-full md:w-2/3 lg:w-1/2 xl:w-1/3 2xl:w-1/4 mx-auto my-5">
      <Listbox value={selectedFilter} onChange={setSelectedFilter}>
        {({ open }) => (
          <>
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-gray-700 rounded-lg shadow-md cursor-default focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <span className="block truncate">{selectedFilter}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronUpDownIcon className="w-5 h-5 text-gray-400" />
              </span>
            </Listbox.Button>
            <Transition
              show={open}
              enter="transition-opacity duration-150"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options static className="absolute w-full py-1 mt-1 overflow-auto text-base bg-gray-700 rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <Listbox.Option
                    key="Recent"
                    value="Recent"
                    className={({ active }) =>
                      classNames(
                        active ? 'text-white bg-green-500' : 'text-gray-300',
                        'cursor-default select-none relative py-2 pl-10 pr-4'
                      )
                    }
                  >
                      
                  </Listbox.Option>
              </Listbox.Options>
            </Transition>
          </>
        )}
      </Listbox>
      <p className="mt-2 text-sm text-gray-400">Filtered Options For Proposals</p>
    </div>
  )}
  </div>
   

  {selectedTab === 'Propose' && (
   <div className="mx-4 md:mx-12 lg:mx-24 xl:mx-48 2xl:mx-72 my-10 p-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl text-gray-100 transition-all duration-500 ease-in-out transform hover:scale-105">
     <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 hover:text-green-300">
       Create A Proposal
     </h2>
     <form 
       className="mt-4 space-y-3" 
       autoComplete="off"
       onSubmit={(e) => {
         e.preventDefault();
         const newProposal = {
           id: proposals.length + 1,  // Ensure each proposal has a unique id
           title: e.target.elements['workshopName'].value,
           date: e.target.elements['date'].value,
           description: e.target.elements['description'].value
         };
         setProposals([...proposals, newProposal]);  // Add new proposal
         alert('Form has been submitted successfully.'); // Display an alert
       }}
     >
       <input
         name="workshopName"
         type="text"
         placeholder="Workshop Name"
         className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
         required
       />
       <input
         name="date"
         type="date"  // Changed to 'date' for proper date input
         placeholder="Date"
         className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
         required
       />
       <textarea
         name="description"
         placeholder="Description"
         className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
         required
       ></textarea>
       <button
         type="submit"
         className="px-6 py-2 font-semibold text-white rounded-lg shadow-lg bg-gradient-to-r from-teal-300 to-cyan-500 hover:from-teal-400 hover:to-cyan-600 transition ease-in-out duration-300"
       >
         Enter
       </button>
     </form>
   </div>
)}



{selectedTab === 'Vote' && (
  <div>
    {proposals.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 my-10">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl text-gray-100 transition-all duration-500 ease-in-out transform hover:scale-105">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 hover:text-green-300">
              {proposal.title}
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700 rounded-lg">
                <p>{proposal.date}</p>
                <p>{proposal.description}</p>
                {/* Implement voting buttons or mechanism here */}
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
  <div className="mx-4 md:mx-12 lg:mx-24 xl:mx-48 2xl:mx-72 my-10 p-8 bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl rounded-2xl text-gray-100 transition-all duration-500 ease-in-out transform hover:scale-105">
  <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 hover:text-green-300">
    View Results
  </h2>
  <p className="text-center mb-6">Check out the results of past proposals.</p>
 </div>
)}

</div>
</div>
  );
}
export default SendFTWithTheme;


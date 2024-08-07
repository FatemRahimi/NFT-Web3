import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRef, useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import ABI from './ABI.json';
import Web3 from 'web3';
import axios from "axios";

const CONTRACT_ADDRESS = '0x38ac452166A993A4031172c6802923DaA4215796';
const BASE_URL = 'https://api-rinkeby.etherscan.io/api';
const IMG_PATH =
  'https://ipfs.io/ipfs/QmWVgiKR7XoCRENXVgNM3KhMB3Xvhoo6oEgqDcq3hnSduF/';

function App() {
  const mintAmountRef = useRef(1);
  const [address, setAddress] = useState('');
  const [contract, setContract] = useState(null);
  const [nftData, setNftData] = useState(null);

  useEffect(() => {
    window.process = {
      ...window.process,
    };
    fetchnftData();
  }, []);

  const fetchnftData = async () => {
    const nftDataResponse = await axios.get(
      BASE_URL +
        `?module=account&action=tokennfttx&contractaddress=${CONTRACT_ADDRESS}&page=1&offset=100&tag=latest&apikey=${process.env.REACT_APP_API_KEY}`
    );
    setNftData(nftDataResponse.data.result);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install Metamask wallet');
      return;
    }
    let web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    setAddress(accounts[0]);

    setContract(new web3.eth.Contract(ABI, CONTRACT_ADDRESS));
  };

  const mint = async () => {
    if (window.ethereum && address) {
      const mintAmount = Number(mintAmountRef.current.value);
      if (mintAmount > 0 && mintAmount < 6) {
        const mintRate = await contract.methods.cost().call();
        const totalAmount = mintAmount * mintRate;
        contract.methods
          .mint(address, mintAmount)
          .send({ from: address, value: String(totalAmount) });
      }
    }
  };
  return (
    <div className="container">
      <div className="row justify-content-center text-center mt-5">
        <form className="col-lg-6 shadow p-3 mb-5 bg-white rounded">
          <h4>Mint Portal</h4>
          {!address ? (
            <>
              <h5>Please connect your wallet</h5>
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </>
          ) : (
            <div className="my-3 card gap-3">
              <label>{address ? address : 'Wallet Address'}</label>
              <input
                ref={mintAmountRef}
                className="mx-2"
                type="number"
                defaultValue={1}
                min={1}
                max={5}
              />
              <label>Please select the number of NFTs to mint (1-5)</label>
              <Button onClick={mint}>Mint</Button>
              <label>Price 0.05 Rinkeby ETH each mint</label>
            </div>
          )}

          <h5 className="mt-2">Tokens Minted {nftData?.length}/1000</h5>
        </form>
      </div>
      <div className="row items mt-3">
        {nftData?.map((nft) => {
          return (
            <div
              key={`exo_${nft.tokenID}`}
              className="col-12 col-sm-6 col-lg-3 mb-3 item"
            >
              <div className="card">
                <div className="image-over">
                  <img
                    className="card-img-top"
                    src={IMG_PATH + nft.tokenID + '.png'}
                    alt=""
                  />
                </div>
                <div className="card-caption col-12 p-0">
                  <div className="card-body">
                    <h5 className="mb-0">
                      {nft.tokenName + ' #' + nft.tokenID}
                    </h5>
                    <h6 className="mt-2">Owner: {nft.to}</h6>
                    <div className="card-bottom d-flex justify-content-between">
                      {address && (
                        <Button className="btn btn-bordered-white btn-smaller mt-3">
                          <i className="mr-2" />
                          Buy Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

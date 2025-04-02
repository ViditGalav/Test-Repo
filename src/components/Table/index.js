/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Button from "react-bootstrap/Button";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./style.css";

const SenderTable = (props) => {
  let indexOfLastItem;
  let indexOfFirstItem;
  let currentItems;
  const { wallets, setWallets, isConnected } = props;
  const { currentPage, setCurrentPage } = useState(1);
  const [itemPerPage] = useState(5);
  const [error, setError] = useState("");

  useEffect(() => {
    indexOfLastItem = currentPage * itemPerPage;
    indexOfFirstItem = indexOfLastItem - itemPerPage;
    currentItems = wallets && wallets.slice(indexOfFirstItem, indexOfLastItem);
  }, [wallets, currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const validateEthereumAddress = (address) => {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    
    try {
      const text = await file.text();
      const addresses = text
        .split(/[\n,]/)
        .map(addr => addr.trim())
        .filter(addr => addr !== "");

      // Validate addresses
      const invalidAddresses = addresses.filter(addr => !validateEthereumAddress(addr));
      
      if (invalidAddresses.length > 0) {
        setError(`Found ${invalidAddresses.length} invalid Ethereum addresses`);
        return;
      }

      // Remove duplicates
      const uniqueAddresses = [...new Set(addresses)];
      
      if (uniqueAddresses.length !== addresses.length) {
        setError(`Removed ${addresses.length - uniqueAddresses.length} duplicate addresses`);
      }

      setWallets(uniqueAddresses);
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Error processing file. Please check the file format.");
    }
  };

  return (
    <div className="table-container">
      {error && <div className="error-message">{error}</div>}
      <Table responsive>
        <thead>
          <tr>
            <th>No</th>
            <th>Wallet Address</th>
          </tr>
        </thead>
        <tbody>
          {wallets && wallets.length > 0 ? (
            wallets.map((address, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  {address.slice(0, 6)}...{address.slice(-4)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No addresses loaded</td>
            </tr>
          )}
        </tbody>
      </Table>

      <div className="tableButton">
        <input
          type="file"
          accept=".csv,.txt"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            className="uploadButton"
            disabled={!isConnected}
            as="span"
          >
            Upload CSV File
          </Button>
        </label>
      </div>
    </div>
  );
};

export default SenderTable;

"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { addServer, fetchServers, selectServer } from "@/redux/accountSlice";
import ServerList from "@/components/account/ServerList";
import ServerDetail from "@/components/account/ServerDetail";
import ProcessSidebar from "@/components/account/ProcessSidebar";
import { motion } from "framer-motion";
import {
  addHistory,
  clearCommand,
  clearHistory,
  selectCommand,
  selectHistory,
} from "@/redux/uiSlice";
import { addHistoryLine } from "@/utils/helpes";
import { initWebSocket, closeWebSocket } from "@/services/webSocketService";

const AccountPage = () => {
  const dispatch: AppDispatch = useDispatch();
  const { servers, selectedServer, loading, error } = useSelector(
    (state: RootState) => state.account,
  );
  const command = useSelector(selectCommand);
  const history = useSelector(selectHistory);

  const [commandStep, setCommandStep] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      initWebSocket(token);
    } else {
      setIsAuthenticated(false);
      window.location.href = "/";
    }

    dispatch(clearHistory());
    dispatch(clearCommand());
    dispatch(fetchServers());

    return () => {
      closeWebSocket();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!command?.text || !isAuthenticated) return;

    const commandStr = command.text.toLowerCase().trim();

    if (commandStep === "awaiting_server_name_to_delete") {
      const serverName = command.text.trim();
      const serverToDelete = servers.find((s) => s.name === serverName);
      if (serverToDelete) {
        dispatch(deleteServer(serverToDelete.id));
        dispatch(addHistory(addHistoryLine(`Deleting server '${serverName}'...`)));
      } else {
        dispatch(addHistory(addHistoryLine(`Server '${serverName}' not found.`)));
      }
      setCommandStep(null);
      dispatch(clearCommand());
      return;
    }

    switch (commandStr) {
      case "add-server":
        setCommandStep("awaiting_server_name");
        dispatch(addHistory(addHistoryLine("Enter server name:")));
        break;
      case "delete-server":
        setCommandStep("awaiting_server_name_to_delete");
        dispatch(addHistory(addHistoryLine("Enter server name to delete:")));
        break;
      case "logout":
        sessionStorage.removeItem("token");
        dispatch(addHistory(addHistoryLine("Logging out...")));
        window.location.href = "/";
        break;
      default:
        dispatch(addHistory(addHistoryLine(`Unknown command: ${commandStr}`)));
        break;
    }

    dispatch(clearCommand());
  }, [command, dispatch, commandStep, isAuthenticated]);

  const handleSelectServer = (serverId: number) => {
    dispatch(selectServer(serverId));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4 lg:flex-row">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/4"
      >
        <ServerList
          servers={servers}
          history={history}
          selectedServerId={selectedServer?.id}
          onSelectServer={handleSelectServer}
          loading={loading}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full lg:w-1/2"
      >
        {loading && !selectedServer && <p>Loading server details...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {selectedServer ? (
          <ServerDetail server={selectedServer} />
        ) : (
          !loading && (
            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-gray-600">
              <p className="text-gray-400">Select a server to view details</p>
            </div>
          )
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full lg:w-1/4"
      >
        {selectedServer && <ProcessSidebar server={selectedServer} />}
      </motion.div>
    </div>
  );
};

export default AccountPage;

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

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      initWebSocket(token);
    }

    dispatch(clearHistory());
    dispatch(clearCommand());
    dispatch(fetchServers());

    return () => {
      closeWebSocket();
    };
  }, [dispatch]);

  useEffect(() => {
    if (!command?.text) return;

    const commandStr = command.text.toLowerCase().trim();

    if (commandStep === "awaiting_server_name") {
      dispatch(addServer(command.text)).then((action) => {
        if (addServer.fulfilled.match(action)) {
          const newServer = action.payload;
          dispatch(
            addHistory(
              addHistoryLine(
                `Server '${newServer.name}' created. API Key: ${newServer.api_key}`,
              ),
            ),
          );
        }
      });
      setCommandStep(null);
      dispatch(clearCommand());
      return;
    }

    switch (commandStr) {
      case "add-server":
        setCommandStep("awaiting_server_name");
        dispatch(addHistory(addHistoryLine("Enter server name:")));
        break;
      default:
        dispatch(addHistory(addHistoryLine(`Unknown command: ${commandStr}`)));
        break;
    }

    dispatch(clearCommand());
  }, [command, dispatch, commandStep]);

  const handleSelectServer = (serverId: number) => {
    dispatch(selectServer(serverId));
  };

  return (
    <div className="flex h-full w-full gap-4 p-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-1/4"
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
        className="w-1/2"
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
        className="w-1/4"
      >
        {selectedServer && <ProcessSidebar server={selectedServer} />}
      </motion.div>
    </div>
  );
};

export default AccountPage;

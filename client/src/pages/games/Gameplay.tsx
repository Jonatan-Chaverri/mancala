import { useState } from "react";
import GameBoard from "@/components/gameplay/game-board";
import MessageArea from "@/components/message-area.tsx";
import { useDojo } from "@/dojo/useDojo";
import { useAccount } from "@starknet-react/core";
import { useParams } from "react-router-dom";
import { MancalaBoardModelQuery, MancalaPlayQuery } from "@/lib/constants";
import { useQuery } from "@apollo/client";
import AudioSection from "@/components/gameplay/audio-section";
import GameChat from "@/components/gameplay/game-chat";
import LeaderboardButton from "@/components/gameplay/leaderboard-button";
import RestartButton from "@/components/gameplay/restart-button";
import EndgameButton from "@/components/gameplay/end-game-button";
import GameNavigation from "@/components/gameplay/game-navigation";

export default function Gameplay() {
  const { gameId } = useParams();
  const { loading: game_metadata_loading, error: game_metadata_error, data: game_metadata, startPolling: startMetadataPolling } = useQuery(MancalaBoardModelQuery, { variables: { gameId: gameId } });
  const { loading: game_players_loading, data: game_players, startPolling: startPlayersPolling } = useQuery(MancalaPlayQuery, { variables: { gameId: gameId } });
  const { system } = useDojo();
  const game_node = game_metadata?.mancalaMancalaBoardModels?.edges?.[0]?.node;
  const account = useAccount();
  const [moveMessage, setMoveMessage] = useState<string | undefined>();
  const [timeRemaining, setTimeRemaining] = useState(0);

  startMetadataPolling(1000);
  startPlayersPolling(1000);

  return (
    <main className="min-h-screen w-full bg-[#0F1116] flex flex-col items-center overflow-y-scroll">
      <GameNavigation game_players={game_players} game_node={game_node} account={account} gameId={gameId} timeRemaining={timeRemaining} setTimeRemaining={setTimeRemaining} />
      <div className="w-full h-[calc(100vh-200px)] max-w-7xl flex flex-row items-start space-x-10">
        <div className="flex flex-col justify-center space-y-5 w-fit">
          <RestartButton />
          <EndgameButton />
        </div>
        <div className="flex-1 w-full h-full">
          <GameBoard
            game_players={game_players}
            game_node={game_node}
            game_metadata={game_metadata}
            system={system}
            account={account}
            gameId={gameId || ""}
            setMoveMessage={setMoveMessage}
            setTimeRemaining={setTimeRemaining}
          />
          <div className="relative flex flex-row items-center justify-between w-full mt-10 h-[fit-content]">
            <AudioSection />
            <MessageArea
              game_metadata_error={game_metadata_error}
              game_players_error={game_metadata_error}
              game_metadata={game_metadata}
              address={account?.account?.address}
              game_metadata_loading={game_metadata_loading}
              moveMessage={moveMessage}
              game_players_loading={game_players_loading}
              game_players={game_players}
            />

            {/* Leaderboard and chat */}
            <div className="flex flex-row items-start justify-center pb-5 space-x-5">
              <LeaderboardButton />
              <GameChat />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
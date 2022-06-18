import { useContext, FC, useState } from "react";
import {
  FormControl,
  Input,
  Button,
  Stack,
  Text,
  useClipboard,
  Divider,
  Icon
} from "@chakra-ui/react";

import {
  CopyIcon
} from "@chakra-ui/icons";

import { SocketContext } from "./Context";
import Header from "./components/Header";
import { PulseIcon } from "./components/Icons";


const App: FC = () => {
  let { socketId, callAccepted, callEnded, ownVideo, userVideo, stream, call, setName, leaveCall, callUser, answerCall } = useContext(SocketContext)!;

  const [idToCall, setIdToCall] = useState("");
  const { hasCopied, onCopy } = useClipboard(socketId);

  return (
    // Guides the page layout all the way down
    <Stack
      direction={{ base: "column", md: "column" }}
      alignItems="center"
    >
      <Header />
      <Divider />

      <Stack direction={{ base: "column", md: "column" }} maxW="20em">
        <FormControl>
          <Stack spacing={4} direction='row' align='center' marginBottom={4} marginTop={50}>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              onChange={(e) => setName(e.target.value)}
            />

            <Button onClick={onCopy} w="8em">
              {hasCopied ? (
                <Text>Copied</Text>
              ) : (
                <>
                  <CopyIcon m={1} />
                  <Text>Copy ID</Text>
                </>
              )}
            </Button>
          </Stack>

          <Stack spacing={4} direction='row' align='center'>
            <Input
              id="otherPerson"
              type="text"
              placeholder="ID of user to call"
              onChange={(e) => setIdToCall(e.target.value)}
            ></Input>

            {callAccepted && !callEnded ? (
            <Button onClick={leaveCall} bg="is_error" w="8em">Close call</Button>
            ) : (
              <Button onClick={() => callUser(idToCall)} bg="is_success" w="8em">Call user</Button>
            )}
          </Stack>
        </FormControl>
      </Stack>
      
      <Stack
        direction={{ base: "column", md: "row" }}
      >
        {stream && (
          <div>
            <p>You</p>
            <video
              playsInline
              muted
              ref={ownVideo}
              autoPlay
            ></video>
          </div>
        )}

        {callAccepted && !callEnded && (
          <div>
            <p>{call ? call.name : "Other person"}</p>
            <video
              ref={userVideo}
              autoPlay
              controls
            ></video>
          </div>
        )}
      </Stack>
        
      {call?.isReceivingCall && !callAccepted && (
        <>
          <PulseIcon />
          <Text>{call!.name} is calling</Text>
          <Button onClick={answerCall}>Pick up</Button>
        </>
      )}
    </Stack>
  );
}

export default App;

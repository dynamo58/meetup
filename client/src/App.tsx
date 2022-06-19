import React, { useContext, useState } from "react";
import {
  FormControl,
  Input,
  Button,
  Stack,
  Text,
  useClipboard,
  Divider,
  Flex,
  Center
} from "@chakra-ui/react";

import { SocketContext } from "./Context";
import Header from "./components/Header";
import Video from "./components/Video";
import RoomSettings, { RoomRole } from "./components/RoomSettings";
import { PulseIcon } from "./components/Icons";


const App: React.FC = () => {
  let { socketId, callAccepted, callEnded, ownVideo, userVideo, stream, call, setName, leaveCall, callUser, answerCall } = useContext(SocketContext)!;

  const [idToCall, setIdToCall] = useState("");
  const { hasCopied, onCopy } = useClipboard(socketId);

  return (
    // Guides the page layout all the way down
    <Stack
      direction="column"
      alignItems="center"
    >
      <Header />
      <Divider />


      <Stack
        direction="row"
        width="100vw"
        justifyContent="space"
      >
        <Stack
          position="relative"
          left={0}
          height="100%"
        >
          <RoomSettings role={RoomRole.Owner} />
        </Stack>
        
        <Divider orientation='vertical' />

        <Stack
          width="100%"
          height="100%"

        >
          <Center>
            {stream && (
              <Video
                ref={ownVideo}
                name="You"
                mute={true}
              />
            )}

            {callAccepted && !callEnded && (
              <Video
                ref={userVideo}
                name={call?.name ? call.name : "[no name]"}
                mute={false}
              />
            )}
          </Center>

          {call?.isReceivingCall && !callAccepted && (
            <>
              <PulseIcon />
              <Text>
                <Text fontWeight="650" display="inline-block">
                  {call.name ? call.name : "[no name]"}
                </Text>
                {" is calling"}
              </Text>
              <Button onClick={answerCall} bg="accent_primary">Pick up</Button>
            </>
          )}
        </Stack>
      </Stack>

      {/* <Stack direction="column" maxW="20em">
        <FormControl>
          <Stack spacing={4} direction='row' align='center' marginBottom={4} marginTop={50}>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              onChange={(e) => setName(e.target.value)}
            />

            <Button onClick={onCopy} w="8em" bg={ hasCopied ?  "accent_primary" : undefined }>
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
              <Button onClick={() => callUser(idToCall)} w="8em">Call user</Button>
            )}
          </Stack>
        </FormControl>
      </Stack> */}
    </Stack>
  );
}

export default App;

import { useContext, FC, useState } from "react";
import { SocketContext } from "./Context";
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  Stack,
  useColorMode,
  Flex,
  Text,
  useClipboard
} from "@chakra-ui/react";


const App: FC = () => {
  let { socketId, callAccepted, callEnded, ownVideo, userVideo, stream, call, setName, leaveCall, callUser, answerCall } = useContext(SocketContext)!;
  const [idToCall, setIdToCall] = useState("");

  const { hasCopied, onCopy } = useClipboard(socketId)
  const { colorMode, toggleColorMode } = useColorMode();
  return (
      <Stack
        direction={{ base: "column", md: "column" }}
        justify="center"
        alignItems="center"
      >
        <Flex
          as="nav"
          align="center"
          justify="center"
          wrap="wrap"
          gap={5}
          padding={6}
        >
          <Text>Docs</Text>
          <Text>Examples</Text>
          <Button onClick={toggleColorMode}>
            Toggle {colorMode === "light" ? "Dark" : "Light"}
          </Button>
        </Flex>

        <Stack direction={{ base: "column", md: "column" }} maxW="20em">
          <FormControl>
            <FormLabel htmlFor="name">Your name</FormLabel>
            <Input
              id="name"
              type="text"
              placeholder="The name your peers to see"
              onChange={(e) => setName(e.target.value)}
            />

            <Button onClick={onCopy}>
              {hasCopied ? "Copied" : "Copy ID"}
            </Button>

          </FormControl>

          <br /><br />

          <FormControl>
            <Input
              id="otherPerson"
              type="text"
              onChange={(e) => setIdToCall(e.target.value)}
            ></Input>

            {callAccepted && !callEnded ? (
              <Button onClick={leaveCall}>Close call</Button>
            ) : (
              <Button onClick={() => callUser(idToCall)}>Call user</Button>
            )}
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
            <Text>{call!.name} is calling</Text>
            <Button onClick={answerCall}>Pick up</Button>
          </>
        )}
      </Stack>
  );
}

export default App;

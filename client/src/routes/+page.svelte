<script lang="ts">
  import Background from "../game/Background.svelte";
  import Canvas from "../game/Canvas.svelte";
  import Character from "../game/Character.svelte";
  import DotGrid from "../game/DotGrid.svelte";
  import Text from "../game/Text.svelte";
  import FPS from "../game/FPS.svelte";
  import LeftPaddle from "../game/LeftPaddle.svelte";
  import { height, width } from "../game/game";
  import RightPaddle from "../game/RightPaddle.svelte";
</script>

<div class="h-screen w-screen flex justify-center items-center">
  <Canvas class="bg-white w-[80%] h-auto aspect-[1.6]">
    <Background color="hsl(0, 0%, 10%)">
      <!-- <DotGrid divisions={30} color="hsla(0, 0%, 100%, 0.5)" /> -->
    </Background>
    <!-- <Character size={10} /> -->
    <LeftPaddle />
    <RightPaddle />
    <!-- svelte-ignore missing-declaration -->
    <!-- <Text
      text="Click and drag around the page to move the character."
      fontSize={12}
      align="right"
      baseline="bottom"
      x={$width - 20}
      y={$height - 20}
    />
    <FPS /> -->
  </Canvas>
</div>

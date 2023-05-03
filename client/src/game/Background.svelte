<script lang="ts">
  import { renderable } from "./game";
  export let color: string;

  renderable((props: any) => {
    const { context, width, height } = props;
    context.fillStyle = color;
    context.fillRect(0, 0, width, height);
  });
</script>

<!-- The following allows this component to nest children -->
<slot />

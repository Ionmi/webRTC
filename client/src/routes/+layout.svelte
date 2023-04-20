<script lang="ts">
  import "../app.css";
</script>

<div class="relative min-h-screen">
  <main style="padding-bottom: 10rem;">
    <slot />
  </main>
  <footer
    class="absolute bottom-0 w-[100%] h-40 flex justify-center items-center"
  >
    <h2>Made with &#10084 by ioromero</h2>
  </footer>
</div>

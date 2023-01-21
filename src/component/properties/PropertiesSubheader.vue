<template>
  <div class="c-properties-subheader">
    <span class="text">
      <slot/>
    </span>
  </div>
</template>

<style lang="scss">
.c-properties-subheader {
  text-align: center;
  display: flex;
  align-items: center;
  margin-top: 15px;
  margin-bottom: 5px;

  &:before, &:after {
    content: '';
    border-bottom: 1px solid grey;
    height: 0;
    flex: 1;
  }

  .text {
    color: rgb(190, 190, 190);
    text-transform: uppercase;
    font-size: 0.8em;
    margin: 0 10px;
  }
}
</style>
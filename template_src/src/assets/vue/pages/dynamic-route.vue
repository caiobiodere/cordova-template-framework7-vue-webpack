<template>
  <f7-page>
    <f7-navbar title="Dynamic Route" back-link="Back" sliding></f7-navbar>
    <f7-block inner>
      <ul>
        <li><b>Url:</b> {{$f7route.url}}</li>
        <li><b>Path:</b> {{$f7route.path}}</li>
        <li><b>Hash:</b> {{$f7route.hash}}</li>
        <li><b>Params:</b>
          <ul>
            <li v-for="(value, key) in $f7route.params" :key="'param-' + key"><b>{{key}}:</b> {{value}}</li>
          </ul>
        </li>
        <li><b>Query:</b>
          <ul>
            <li v-for="(value, key) in $f7route.query" :key="'query-' + key"><b>{{key}}:</b> {{value}}</li>
          </ul>
        </li>
        <li><b>Route:</b> {{$f7route.route}}</li>
      </ul>
    </f7-block>
    <f7-block inner>
      <f7-link @click="$f7router.back()">Go back via Router API</f7-link>
    </f7-block>

  </f7-page>
</template>

<script>
  import { f7Page, f7Navbar, f7Block, f7Link } from "framework7-vue";
  export default {
    components: {
      f7Page, 
      f7Navbar, 
      f7Block, 
      f7Link
    }
  }
</script>

<template>
  <f7-page>
    <f7-navbar large title="About" title-large="About" back-link="Framework7"></f7-navbar>
    <f7-block-title>Welcome to Framework7</f7-block-title>
    <f7-block strong>
      <p>Framework7 - is a free and open source HTML mobile framework to develop hybrid mobile apps or web apps with iOS or Android (Material) native look and feel. It is also an indispensable prototyping apps tool to show working app prototype as soon as possible in case you need to. Framework7 is created by Vladimir Kharlampidi (iDangero.us).</p>
      <p>The main approach of the Framework7 is to give you an opportunity to create iOS and Android (Material) apps with HTML, CSS and JavaScript easily and clear. Framework7 is full of freedom. It doesn't limit your imagination or offer ways of any solutions somehow. Framework7 gives you freedom!</p>
      <p>Framework7 is not compatible with all platforms. It is focused only on iOS and Android (Material) to bring the best experience and simplicity.</p>
      <p>Framework7 is definitely for you if you decide to build iOS and Android hybrid app (PhoneGap) or web app that looks like and feels as great native iOS or Android (Material) apps.</p>
    </f7-block>
    <f7-list>
      <f7-list-item
        swipeout
        title="Facebook"
        after="17:14"
        subtitle="New messages from John Doe"
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sagittis tellus ut turpis condimentum, ut dignissim lacus tincidunt. Cras dolor metus, ultrices condimentum sodales sit amet, pharetra sodales eros. Phasellus vel felis tellus. Mauris rutrum ligula nec dapibus feugiat. In vel dui laoreet, commodo augue id, pulvinar lacus."
      >
        <f7-swipeout-actions left>
          <f7-swipeout-button overswipe color="green" @click="$f7router.back()">Reply</f7-swipeout-button>
          <f7-swipeout-button color="blue" @click="$f7router.back()">Forward</f7-swipeout-button>
        </f7-swipeout-actions>
        <f7-swipeout-actions right>
          <f7-swipeout-button @click="$f7router.back()">More</f7-swipeout-button>
          <f7-swipeout-button color="orange" @click="$f7router.back()">Mark</f7-swipeout-button>
          <f7-swipeout-button
            delete
            overswipe
            confirm-text="Are you sure you want to delete this item?"
          >Delete</f7-swipeout-button>
        </f7-swipeout-actions>
      </f7-list-item>
      <f7-list-item
        swipeout
        title="Twitter"
        after="20:00"
        subtitle="New messages from John Doe"
        text="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sagittis tellus ut turpis condimentum, ut dignissim lacus tincidunt. Cras dolor metus, ultrices condimentum sodales sit amet, pharetra sodales eros. Phasellus vel felis tellus. Mauris rutrum ligula nec dapibus feugiat. In vel dui laoreet, commodo augue id, pulvinar lacus."
      >
        <f7-swipeout-actions left>
          <f7-swipeout-button overswipe color="green" @click="$f7router.back()">Reply</f7-swipeout-button>
          <f7-swipeout-button color="blue" @click="$f7router.back()">Forward</f7-swipeout-button>
        </f7-swipeout-actions>
        <f7-swipeout-actions right>
          <f7-swipeout-button @click="$f7router.back()">More</f7-swipeout-button>
          <f7-swipeout-button color="orange" @click="$f7router.back()">Mark</f7-swipeout-button>
          <f7-swipeout-button
            delete
            overswipe
            confirm-text="Are you sure you want to delete this item?"
          >Delete</f7-swipeout-button>
        </f7-swipeout-actions>
      </f7-list-item>
    </f7-list>
  </f7-page>
</template>
<script>
export default {
  components: {}
};
</script>
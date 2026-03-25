<template>
  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <router-link to="/" class="navbar__logo">
          UPM <span>Events</span>
        </router-link>
        <p>Plateforme centralisée pour la vie de campus de l'Université Internationale de Marrakech. Vivez l'expérience UPM.</p>
      </div>

      <div class="footer__links">
        <h6>Navigation</h6>
        <ul>
          <li><router-link to="/">Dashboard</router-link></li>
          <li><router-link to="/polls">Boîte à Idées</router-link></li>
        </ul>
      </div>

      <div class="footer__links">
        <h6>Légal</h6>
        <ul>
          <li><a href="#">Mentions Légales</a></li>
          <li><a href="#">Confidentialité</a></li>
        </ul>
      </div>
    </div>

    <div class="container footer__bottom">
      <p>&copy; 2026 UPM Events. Tous droits réservés.</p>
      <p>Design inspiré par l'esthétique Jazz.</p>
    </div>
  </footer>
</template>

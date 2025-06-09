## Getting Help

### Before Asking for Help

1. **Check logs**: Look at Home Assistant logs and browser console
2. **Try minimal config**: Test with simplest possible configuration
3. **Update everything**: Ensure HA, HACS, and card are up to date
4. **Search existing issues**: Check GitHub issues for similar problems

### Where to Get Help

- **📖 Documentation**: Check our [docs folder](../docs/) for guides
- **💬 GitHub Discussions**: [Ask questions](https://github.com/homeassistant-extras/room-summary-card/discussions)
- **🐛 GitHub Issues**: [Report bugs](https://github.com/homeassistant-extras/room-summary-card/issues)
- **💬 Discord**: [Join our Discord](https://discord.gg/NpH4Pt8Jmr)

### Information to Include

When asking for help, please include:

1. **Home Assistant version**
2. **Card version**
3. **Browser and version**
4. **Complete card configuration** (sanitize sensitive data)
5. **Error messages** (from HA logs and browser console)
6. **Screenshots** (if visual issue)
7. **Steps to reproduce** the problem

### Example Bug Report

```yaml
# Home Assistant Version: 2024.1.0
# Card Version: 0.23.0
# Browser: Chrome 120.0
# Issue: Background image not showing

# Configuration:
type: custom:room-summary-card
area: living_room
background:
  image: /local/images/living-room.jpg
  opacity: 30
# Error from browser console:
# Failed to load resource: /local/images/living-room.jpg 404 (Not Found)

# Steps to reproduce:
# 1. Add card to dashboard
# 2. Set background image path
# 3. Image doesn't appear, shows broken icon
```

### Emergency Workarounds

If the card is completely broken:

1. **Remove from dashboard**: Delete card temporarily
2. **Use YAML mode**: Configure manually instead of UI
3. **Revert to previous version**: Downgrade if new version has issues
4. **Use alternative cards**: Button-card or entity cards as temporary replacement

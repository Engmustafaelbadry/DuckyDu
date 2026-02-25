# Touch Calibration Notes (XPT2046)

If touch points do not match finger position:

1. Confirm SPI is enabled:
   - `sudo raspi-config` -> Interface Options -> SPI -> Enable
2. Confirm overlay line exists in `/boot/firmware/config.txt`:
   - `dtoverlay=ads7846,penirq=25,swapxy=0,xmin=200,xmax=3900,ymin=200,ymax=3900`
3. Reboot and test.
4. Tune values:
   - If X is reversed: swap `xmin` and `xmax`
   - If Y is reversed: swap `ymin` and `ymax`
   - If axes are crossed: `swapxy=1`
   - If edge taps miss: tighten min/max toward center
5. Reboot after each change.

For some 5-inch displays, the vendor provides a custom overlay. If generic `ads7846` does not work, use the vendor's documented overlay and keep the kiosk app setup unchanged.

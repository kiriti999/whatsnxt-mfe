"use client";

import React from "react";
import { Text, Box, Stack } from "@mantine/core";
import classes from "./ContactIcons.module.css";
import {
  IconMail,
  IconPhoneCall,
  IconMapPin,
  IconClockHour3,
} from "@tabler/icons-react";

export function ContactIconsList() {
  return (
    <Stack>
      {infoList.map((item, i) => (
        <div className={`${classes.wrapper} d-flex align-baseline`} key={i}>
          <Box mr="md">{item.icon}</Box>
          <div>
            <div className={classes.description}>{item.description}</div>
          </div>
        </div>
      ))}
    </Stack>
  );
}

const infoList: ContactIconProps[] = [
  { description: <Text fz={18} c="white">info@whatsnxt.in</Text>, icon: <IconMail size={24} /> },
  { description: <Text fz={18} c="white">+91 6300711966</Text>, icon: <IconPhoneCall size={24} /> },
  { description: <Text fz={18} c="white">Hyderabad, India</Text>, icon: <IconMapPin size={24} /> },
  { description: <Text fz={18} c="white">Sunday & Saturday: 10:30 - 15:00</Text>, icon: <IconClockHour3 size={24} /> },
  { description: <Text fz={18} c="white">Monday - Friday: 09:00 - 20:00</Text>, icon: <IconClockHour3 size={24} /> },
];

interface ContactIconProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "title"> {
  icon: React.ReactNode;
  description: React.ReactNode;
}

export default ContactIconsList;

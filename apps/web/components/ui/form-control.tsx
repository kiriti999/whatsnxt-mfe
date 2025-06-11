import { Input } from "@mantine/core";
import { FC, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement>{}

const FormControl:FC<InputProps> = ({...props}) => {
    return(
        <Input
            bg={"#f5f5f5"}
            c={"#221638"}
            height={50}
            radius={3}
            pt={1}
            pr={0}
            pb={0}
            pl={15}
            fw={400}
            fz={16}
            style={{
                border: "1px solid #f5f5f5",
                transition: "0.5s",
                boxShadow: "unset"
            }}
            // {...props}
        />
    )
}

export default FormControl
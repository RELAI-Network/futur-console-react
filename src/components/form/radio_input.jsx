/* eslint-disable react/prop-types */
import React from "react";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import {Radio, FormLabel, RadioGroup, FormHelperText} from "@mui/material";

const RadioInput = ({
                        row = true,
                        id,
                        name,
                        value,
                        label,
                        onChange,
                        itemValueBuilder,
                        itemLabelBuilder,
                        items,
                        sx = {m: 0},
                        labelSx,
                        error = false,
                        helperText = "",
                        variant = "standard",
                        disabled = false,
                        labelPlacement = "end",
                        ...props
                    }) => (
        <FormControl
            disabled={disabled}
            variant={variant}
            error={error}
            fullWidth
            sx={sx}
            {...props}
        >
            <FormLabel sx={labelSx} id={id}>
                {label}
            </FormLabel>
            <RadioGroup
                row={row}
                aria-labelledby={id}
                name={name}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
            >
                {items.map((item) => (
                    <FormControlLabel
                        key={`${name  }-${  itemValueBuilder(item)}`}
                        value={itemValueBuilder(item)}
                        control={<Radio/>}
                        label={itemLabelBuilder(item)}
                        labelPlacement={labelPlacement}
                    />
                ))}
            </RadioGroup>
            {error && <FormHelperText>{helperText}</FormHelperText>}
        </FormControl>
    );

export default RadioInput;
